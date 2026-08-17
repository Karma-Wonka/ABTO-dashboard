import { destinationsStore } from '@/constants/abto-data';
import { NextRequest, NextResponse } from 'next/server';

// Public and unauthenticated on purpose — see src/app/api/public/news/route.ts.
export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get('kind') ?? undefined;
  const destinations = await destinationsStore.getAll({ kind });
  return NextResponse.json(
    { success: true, destinations },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
