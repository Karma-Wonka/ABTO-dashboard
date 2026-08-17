import { newsStore } from '@/constants/abto-data';
import { NextRequest, NextResponse } from 'next/server';

// Public and unauthenticated on purpose — this is the marketing content
// the public website (web/) shows every visitor, fetched cross-origin.
// No PII, no writes. See src/app/api/site-content/route.ts for the same
// pattern this was copied from.
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') ?? undefined;
  const news = await newsStore.getAll({ search });
  return NextResponse.json(
    { success: true, news },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
