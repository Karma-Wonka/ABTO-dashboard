import { eventsStore } from '@/constants/abto-data';
import { NextRequest, NextResponse } from 'next/server';

// Public and unauthenticated on purpose — see src/app/api/public/news/route.ts.
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') ?? undefined;
  const events = await eventsStore.getAll({ search });
  return NextResponse.json(
    { success: true, events },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
