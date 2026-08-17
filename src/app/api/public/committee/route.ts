import { committeeStore } from '@/constants/abto-data';
import { NextResponse } from 'next/server';

// Public and unauthenticated on purpose — see src/app/api/public/news/route.ts.
export async function GET() {
  const committee = await committeeStore.getAll();
  return NextResponse.json(
    { success: true, committee },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
