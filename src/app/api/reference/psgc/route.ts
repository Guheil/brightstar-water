import { NextResponse, type NextRequest } from 'next/server';
import { psgcQuerySchema } from '@/lib/addresses/validation';
import { loadPsgcOptions } from '@/lib/addresses/server';
import { getAddressApiContext } from '@/lib/addresses/apiServer';

export async function GET(request: NextRequest) {
  const parsed = psgcQuerySchema.safeParse({
    level: request.nextUrl.searchParams.get('level') ?? undefined,
    provinceCode: request.nextUrl.searchParams.get('provinceCode') ?? undefined,
    municipalityCode: request.nextUrl.searchParams.get('municipalityCode') ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: 'Invalid location request.' }, { status: 400, headers: { 'Cache-Control': 'private, no-store' } });
  const context = await getAddressApiContext('customer-psgc-read', 240, 60);
  if ('response' in context) return context.response;
  const options = await loadPsgcOptions(parsed.data.level, parsed.data.provinceCode, parsed.data.municipalityCode);
  return NextResponse.json({ options }, { headers: { 'Cache-Control': 'private, max-age=3600, stale-while-revalidate=86400' } });
}
