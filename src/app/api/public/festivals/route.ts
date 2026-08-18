import { festivalsStore, festivalCalendarStore } from '@/constants/abto-data';
import { NextResponse } from 'next/server';

// Public and unauthenticated on purpose — see src/app/api/public/news/route.ts.
export async function GET() {
  const [festivals, calendar] = await Promise.all([
    festivalsStore.getAll(),
    festivalCalendarStore.get()
  ]);
  return NextResponse.json(
    // No URL/key here — the PDF lives in a private R2 bucket, so a signed
    // link has to come from an authenticated member session (see ../web's
    // own /api/festival-calendar route), not this public endpoint.
    { success: true, festivals, hasCalendarPdf: !!calendar?.pdf_key },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
