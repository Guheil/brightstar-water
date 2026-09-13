import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS } from '@/lib/orders/apiServer';
import {
  GCashQrImageError,
  processAndUploadGCashQr,
  removeGCashQr,
} from '@/lib/payments/imageServer';
import {
  loadGCashPaymentSettingsRow,
  toAdminGCashPaymentSettingsView,
} from '@/lib/payments/server';
import { updateGCashPaymentSettingsSchema } from '@/lib/payments/validation';
import { isSameOriginMutation } from '@/lib/security/request';

const MAX_FORM_BYTES = 4 * 1024 * 1024;
const MAX_PAYLOAD_CHARS = 4_096;

function hasMultipart(request: NextRequest): boolean {
  return (request.headers.get('content-type') ?? '').toLowerCase().startsWith('multipart/form-data;');
}

export async function GET() {
  const context = await getOperationsApiContext('admin-payment-settings-read', 120, 60, 'admin');
  if ('response' in context) return context.response;

  try {
    const row = await loadGCashPaymentSettingsRow(context.adminClient);
    const view = await toAdminGCashPaymentSettingsView(context.adminClient, row);
    return NextResponse.json(view, { headers: OPERATIONS_PRIVATE_HEADERS });
  } catch (error) {
    console.error('Admin GCash settings read failed.', {
      code: (error as { code?: string })?.code,
    });
    return NextResponse.json(
      { error: 'GCash payment settings could not be loaded.' },
      { status: 500, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: OPERATIONS_PRIVATE_HEADERS });
  }
  if (!hasMultipart(request)) {
    return NextResponse.json({ error: 'Payment settings form data is required.' }, { status: 415, headers: OPERATIONS_PRIVATE_HEADERS });
  }

  const rawLength = request.headers.get('content-length');
  const size = rawLength == null ? Number.NaN : Number(rawLength);
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FORM_BYTES) {
    return NextResponse.json({ error: 'The payment settings request is too large.' }, { status: 413, headers: OPERATIONS_PRIVATE_HEADERS });
  }

  const context = await getOperationsApiContext('admin-payment-settings-update', 20, 600, 'admin');
  if ('response' in context) return context.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'The payment settings form could not be read.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  }

  const rawPayload = form.get('payload');
  if (typeof rawPayload !== 'string' || rawPayload.length > MAX_PAYLOAD_CHARS) {
    return NextResponse.json({ error: 'Payment settings are invalid.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ error: 'Payment settings are invalid.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  }

  const parsed = updateGCashPaymentSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Check the GCash payment settings.' },
      { status: 400, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }

  const qrValue = form.get('qr');
  const qrFile = qrValue instanceof File && qrValue.size > 0 ? qrValue : null;
  if (qrFile && parsed.data.removeQr) {
    return NextResponse.json(
      { error: 'Choose either a replacement QR image or remove the current QR image.' },
      { status: 400, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }

  let current;
  try {
    current = await loadGCashPaymentSettingsRow(context.adminClient);
  } catch {
    return NextResponse.json(
      { error: 'GCash payment settings could not be loaded.' },
      { status: 500, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }

  if (Number(current.version) !== parsed.data.expectedVersion) {
    return NextResponse.json(
      { error: 'Payment settings changed. Reload the page and try again.' },
      { status: 409, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }

  let uploadedQrPath: string | null = null;
  let databaseUpdated = false;
  const previousQrPath = current.qr_path;

  try {
    if (qrFile) uploadedQrPath = await processAndUploadGCashQr(context.adminClient, qrFile);
    const finalQrPath = uploadedQrPath ?? (parsed.data.removeQr ? null : previousQrPath);
    const recipientName = parsed.data.recipientName.trim();
    const accountNumber = parsed.data.accountNumber;

    if (parsed.data.enabled && !recipientName) {
      if (uploadedQrPath) await removeGCashQr(context.adminClient, uploadedQrPath).catch(() => undefined);
      return NextResponse.json(
        { error: 'Add the GCash recipient name before enabling GCash.' },
        { status: 400, headers: OPERATIONS_PRIVATE_HEADERS },
      );
    }
    if (parsed.data.enabled && !accountNumber && !finalQrPath) {
      if (uploadedQrPath) await removeGCashQr(context.adminClient, uploadedQrPath).catch(() => undefined);
      return NextResponse.json(
        { error: 'Add a GCash number, QR code, or both before enabling GCash.' },
        { status: 400, headers: OPERATIONS_PRIVATE_HEADERS },
      );
    }

    const audit = getAuditRequestContext(request);
    const { data: nextVersion, error } = await context.adminClient.rpc('admin_update_gcash_payment_settings', {
      p_actor_id: context.actor.id,
      p_enabled: parsed.data.enabled,
      p_recipient_name: recipientName || null,
      p_account_number: accountNumber || null,
      p_qr_path: finalQrPath,
      p_expected_version: parsed.data.expectedVersion,
      p_request_id: audit.requestId,
      p_client_ip: audit.clientIp,
      p_user_agent: audit.userAgent,
    });

    if (error) {
      if (uploadedQrPath) await removeGCashQr(context.adminClient, uploadedQrPath).catch(() => undefined);
      const stale = /settings changed|reload/i.test(error.message ?? '');
      return NextResponse.json(
        { error: stale ? 'Payment settings changed. Reload the page and try again.' : 'GCash payment settings could not be saved.' },
        { status: stale ? 409 : 500, headers: OPERATIONS_PRIVATE_HEADERS },
      );
    }

    databaseUpdated = true;

    // Previous QR objects remain private in Storage. Keeping them avoids breaking
    // historical order snapshots or an in-flight signed URL that a customer
    // received just before an Administrator changed the current destination.
    try {
      const updated = await loadGCashPaymentSettingsRow(context.adminClient);
      const view = await toAdminGCashPaymentSettingsView(context.adminClient, updated);
      return NextResponse.json(view, { headers: OPERATIONS_PRIVATE_HEADERS });
    } catch {
      // The mutation already committed. Return the canonical values we just wrote
      // instead of reporting a false failure that could encourage a duplicate save.
      return NextResponse.json({
        enabled: parsed.data.enabled,
        recipientName,
        accountNumber,
        qrImageUrl: '',
        qrConfigured: Boolean(finalQrPath),
        version: Number(nextVersion ?? parsed.data.expectedVersion + 1),
      }, { headers: OPERATIONS_PRIVATE_HEADERS });
    }
  } catch (error) {
    if (uploadedQrPath && !databaseUpdated) await removeGCashQr(context.adminClient, uploadedQrPath).catch(() => undefined);
    if (error instanceof GCashQrImageError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'too_large' ? 413 : 400, headers: OPERATIONS_PRIVATE_HEADERS },
      );
    }
    console.error('Admin GCash settings update failed.', {
      userId: context.actor.id,
      code: (error as { code?: string })?.code,
    });
    return NextResponse.json(
      { error: 'GCash payment settings could not be saved.' },
      { status: 500, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }
}
