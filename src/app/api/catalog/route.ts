import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getPublicCatalogSnapshot } from '@/lib/catalog/server';
import { consumeServerRateLimit } from '@/lib/security/rateLimit';
import { createAdminClient } from '@/lib/supabase/admin';

const PUBLIC_CATALOG_HEADERS = {
  'Cache-Control': 'public, max-age=15, s-maxage=30, stale-while-revalidate=120',
} as const;

export async function GET(request: NextRequest) {
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Catalog read is not configured.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
    });
    return NextResponse.json(
      { error: 'The catalog is temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const context = getAuditRequestContext(request);
    const rateLimit = await consumeServerRateLimit(
      adminClient,
      `public-catalog:${context.clientIp ?? 'unknown'}`,
      300,
      60,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many catalog requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            'Cache-Control': 'no-store',
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const snapshot = await getPublicCatalogSnapshot();
    return NextResponse.json(snapshot, { status: 200, headers: PUBLIC_CATALOG_HEADERS });
  } catch (error) {
    console.error('Catalog read failed.', {
      message: error instanceof Error ? error.message : 'Unknown catalog error',
    });
    return NextResponse.json(
      { error: 'The catalog could not be loaded.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
