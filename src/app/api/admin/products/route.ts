import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { getAdminCatalogSnapshot, getAdminProduct } from '@/lib/catalog/server';
import {
  processAndUploadProductImage,
  ProductImageError,
  removeProductImage,
} from '@/lib/catalog/imageServer';
import { readProductMutationForm, validateProductTypeSelection } from '@/lib/catalog/request';
import { isSameOriginMutation } from '@/lib/security/request';
import { consumeAdminRateLimit } from '@/lib/security/rateLimit';
import { createAdminClient } from '@/lib/supabase/admin';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

async function getAuthorizedAdmin() {
  const actor = await getAuthenticatedProfile();
  return actor?.role === 'admin' && actor.status === 'active' && actor.onboarding_stage === 'complete'
    ? actor
    : null;
}

export async function GET() {
  const actor = await getAuthorizedAdmin();
  if (!actor) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
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
    const snapshot = await getAdminCatalogSnapshot();
    return NextResponse.json(snapshot, { status: 200, headers: PRIVATE_NO_STORE });
  } catch (error) {
    console.error('Admin catalog read failed.', {
      message: error instanceof Error ? error.message : 'Unknown catalog error',
    });
    return NextResponse.json({ error: 'Products could not be loaded.' }, { status: 500, headers: PRIVATE_NO_STORE });
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const actor = await getAuthorizedAdmin();
  if (!actor) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'Product management is not configured.' }, { status: 503, headers: PRIVATE_NO_STORE });
  }

  const context = getAuditRequestContext(request);
  const productId = `product-${randomUUID()}`;
  let uploadedImagePath: string | null = null;
  let databaseCreated = false;

  try {
    const rateLimit = await consumeAdminRateLimit(adminClient, `admin-product-create:${actor.id}`, 20, 600);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many product creation attempts. Please try again shortly.' },
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

    const snapshot = await getAdminCatalogSnapshot();
    const typeError = validateProductTypeSelection(form.input, snapshot.productTypes);
    if (typeError) {
      return NextResponse.json({ error: typeError }, { status: 400, headers: PRIVATE_NO_STORE });
    }

    const image = form.image
      ? await processAndUploadProductImage(adminClient, productId, form.image)
      : null;
    uploadedImagePath = image?.path ?? null;

    const { error: rpcError } = await adminClient.rpc('admin_create_product', {
      p_actor_id: actor.id,
      p_product_id: productId,
      p_product_type_code: form.input.productTypeCode,
      p_name: form.input.name,
      p_short_description: form.input.shortDescription,
      p_description: form.input.description,
      p_size_value: form.input.sizeValue,
      p_price_centavos: form.input.priceCentavos,
      p_brand: form.input.brand,
      p_gtin: form.input.gtin,
      p_mpn: form.input.mpn,
      p_image_path: image?.path ?? null,
      p_image_alt: form.input.imageAlt,
      p_image_width: image?.width ?? null,
      p_image_height: image?.height ?? null,
      p_image_bytes: image?.bytes ?? null,
      p_is_featured: form.input.isFeatured,
      p_is_active: form.input.isActive,
      p_opening_stock: form.input.openingStock ?? 0,
      p_reorder_level: form.input.reorderLevel,
      p_request_id: context.requestId,
      p_client_ip: context.clientIp,
      p_user_agent: context.userAgent,
    });

    if (rpcError) {
      if (uploadedImagePath) await removeProductImage(adminClient, uploadedImagePath).catch(() => undefined);
      console.error('Admin product creation failed.', { code: rpcError.code, productId });
      const duplicate = rpcError.code === '23505';
      return NextResponse.json(
        { error: duplicate ? 'A product with the same SKU or URL already exists.' : 'The product could not be created.' },
        { status: duplicate ? 409 : 500, headers: PRIVATE_NO_STORE },
      );
    }

    databaseCreated = true;
    const created = await getAdminProduct(productId);
    if (!created) throw new Error('Created product could not be reloaded.');
    revalidatePath('/api/catalog');
    revalidatePath('/mrje');
    revalidatePath('/brightstar');
    revalidatePath('/mrje/shop');
    revalidatePath('/brightstar/shop');

    return NextResponse.json(
      { product: created.product, inventory: created.inventory },
      { status: 201, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    if (uploadedImagePath && !databaseCreated) await removeProductImage(adminClient, uploadedImagePath).catch(() => undefined);
    if (error instanceof ProductImageError) {
      return NextResponse.json({ error: error.message }, { status: error.code === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE });
    }
    console.error('Unexpected product creation failure.', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'The product could not be created.' }, { status: 500, headers: PRIVATE_NO_STORE });
  }
}
