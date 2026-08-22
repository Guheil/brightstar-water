import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { getAdminProduct } from '@/lib/catalog/server';
import {
  processAndUploadProductImage,
  ProductImageError,
  removeProductImage,
} from '@/lib/catalog/imageServer';
import { readProductMutationForm, validateProductTypeSelection } from '@/lib/catalog/request';
import { productIdSchema } from '@/lib/catalog/validation';
import { isSameOriginMutation } from '@/lib/security/request';
import { consumeAdminRateLimit } from '@/lib/security/rateLimit';
import { createAdminClient } from '@/lib/supabase/admin';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

interface ProductRouteContext {
  params: Promise<{ id: string }>;
}

async function getAuthorizedAdmin() {
  const actor = await getAuthenticatedProfile();
  return actor?.role === 'admin' && actor.status === 'active' && actor.onboarding_stage === 'complete'
    ? actor
    : null;
}

function parseProductId(value: string) {
  return productIdSchema.safeParse(value);
}

function invalidateCatalogPaths() {
  revalidatePath('/api/catalog');
  revalidatePath('/mrje');
  revalidatePath('/brightstar');
  revalidatePath('/mrje/shop');
  revalidatePath('/brightstar/shop');
}

export async function GET(_request: NextRequest, context: ProductRouteContext) {
  const actor = await getAuthorizedAdmin();
  if (!actor) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const { id } = await context.params;
  const parsedId = parseProductId(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'Product management is not configured.' }, { status: 503, headers: PRIVATE_NO_STORE });
  }

  try {
    const limit = await consumeAdminRateLimit(adminClient, `admin-product-read:${actor.id}`, 180, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many product requests. Please try again shortly.' },
        { status: 429, headers: { ...PRIVATE_NO_STORE, 'Retry-After': String(limit.retryAfterSeconds) } },
      );
    }
    const record = await getAdminProduct(parsedId.data);
    if (!record) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
    }
    return NextResponse.json(record, { status: 200, headers: PRIVATE_NO_STORE });
  } catch (error) {
    console.error('Admin product read failed.', {
      productId: parsedId.data,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'The product could not be loaded.' }, { status: 500, headers: PRIVATE_NO_STORE });
  }
}

export async function PATCH(request: NextRequest, context: ProductRouteContext) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const actor = await getAuthorizedAdmin();
  if (!actor) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const { id } = await context.params;
  const parsedId = parseProductId(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'Product management is not configured.' }, { status: 503, headers: PRIVATE_NO_STORE });
  }

  const contextInfo = getAuditRequestContext(request);
  let newImagePath: string | null = null;
  let databaseUpdated = false;

  try {
    const rateLimit = await consumeAdminRateLimit(adminClient, `admin-product-update:${actor.id}`, 80, 600);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many product updates. Please try again shortly.' },
        { status: 429, headers: { ...PRIVATE_NO_STORE, 'Retry-After': String(rateLimit.retryAfterSeconds) } },
      );
    }

    const form = await readProductMutationForm(request);
    if (!form.ok) {
      return NextResponse.json(
        { error: form.error, ...(form.issues ? { issues: form.issues } : {}) },
        { status: form.status, headers: PRIVATE_NO_STORE },
      );
    }

    if (form.image) {
      const uploadLimit = await consumeAdminRateLimit(adminClient, `admin-product-image:${actor.id}`, 20, 600);
      if (!uploadLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many product photo uploads. Please try again shortly.' },
          { status: 429, headers: { ...PRIVATE_NO_STORE, 'Retry-After': String(uploadLimit.retryAfterSeconds) } },
        );
      }
    }

    const existing = await getAdminProduct(parsedId.data);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
    }

    const typeError = validateProductTypeSelection(form.input, existing.productTypes, existing.product.category);
    if (typeError) {
      return NextResponse.json({ error: typeError }, { status: 400, headers: PRIVATE_NO_STORE });
    }

    const image = form.image
      ? await processAndUploadProductImage(adminClient, parsedId.data, form.image)
      : null;
    newImagePath = image?.path ?? null;

    const current = existing.product;
    const { error: rpcError } = await adminClient.rpc('admin_update_product', {
      p_actor_id: actor.id,
      p_product_id: current.id,
      p_product_type_code: form.input.productTypeCode,
      p_name: form.input.name,
      p_short_description: form.input.shortDescription,
      p_description: form.input.description,
      p_size_value: form.input.sizeValue,
      p_price_centavos: form.input.priceCentavos,
      p_brand: form.input.brand,
      p_gtin: form.input.gtin,
      p_mpn: form.input.mpn,
      p_image_path: image?.path ?? current.imagePath,
      p_image_alt: form.input.imageAlt,
      p_image_width: image?.width ?? current.imageWidth,
      p_image_height: image?.height ?? current.imageHeight,
      p_image_bytes: image?.bytes ?? current.imageBytes,
      p_is_featured: form.input.isFeatured,
      p_is_active: form.input.isActive,
      p_reorder_level: form.input.reorderLevel,
      p_request_id: contextInfo.requestId,
      p_client_ip: contextInfo.clientIp,
      p_user_agent: contextInfo.userAgent,
    });

    if (rpcError) {
      if (newImagePath) await removeProductImage(adminClient, newImagePath).catch(() => undefined);
      console.error('Admin product update failed.', { code: rpcError.code, productId: current.id });
      return NextResponse.json({ error: 'The product could not be updated.' }, { status: 500, headers: PRIVATE_NO_STORE });
    }

    databaseUpdated = true;

    if (image && current.imagePath && current.imagePath !== image.path) {
      await removeProductImage(adminClient, current.imagePath).catch((cleanupError) => {
        console.error('Old product image cleanup failed.', {
          productId: current.id,
          message: cleanupError instanceof Error ? cleanupError.message : 'Unknown storage error',
        });
      });
    }

    const updated = await getAdminProduct(current.id);
    if (!updated) throw new Error('Updated product could not be reloaded.');
    invalidateCatalogPaths();
    return NextResponse.json(
      { product: updated.product, inventory: updated.inventory },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    if (newImagePath && !databaseUpdated) await removeProductImage(adminClient, newImagePath).catch(() => undefined);
    if (error instanceof ProductImageError) {
      return NextResponse.json({ error: error.message }, { status: error.code === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE });
    }
    console.error('Unexpected product update failure.', {
      productId: parsedId.data,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'The product could not be updated.' }, { status: 500, headers: PRIVATE_NO_STORE });
  }
}

export async function DELETE(request: NextRequest, context: ProductRouteContext) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const actor = await getAuthorizedAdmin();
  if (!actor) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const { id } = await context.params;
  const parsedId = parseProductId(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'Product management is not configured.' }, { status: 503, headers: PRIVATE_NO_STORE });
  }

  try {
    const limit = await consumeAdminRateLimit(adminClient, `admin-product-delete:${actor.id}`, 20, 600);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many product removal attempts. Please try again shortly.' },
        { status: 429, headers: { ...PRIVATE_NO_STORE, 'Retry-After': String(limit.retryAfterSeconds) } },
      );
    }

    const requestContext = getAuditRequestContext(request);
    const existing = await getAdminProduct(parsedId.data);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
    }

    const { error } = await adminClient.rpc('admin_soft_delete_product', {
      p_actor_id: actor.id,
      p_product_id: parsedId.data,
      p_request_id: requestContext.requestId,
      p_client_ip: requestContext.clientIp,
      p_user_agent: requestContext.userAgent,
    });

    if (error) {
      const conflict = /reserved stock/i.test(error.message);
      return NextResponse.json(
        { error: conflict ? 'This product has stock reserved by an active order. Release the reservation before removing it.' : 'The product could not be removed.' },
        { status: conflict ? 409 : 500, headers: PRIVATE_NO_STORE },
      );
    }

    invalidateCatalogPaths();
    return NextResponse.json({ product: existing.product }, { status: 200, headers: PRIVATE_NO_STORE });
  } catch (error) {
    console.error('Unexpected product removal failure.', {
      productId: parsedId.data,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'The product could not be removed.' }, { status: 500, headers: PRIVATE_NO_STORE });
  }
}
