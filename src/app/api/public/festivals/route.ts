import { festivalsStore, festivalCalendarStore } from '@/constants/abto-data';
import { NextResponse } from 'next/server';

// Public and unauthenticated on purpose — see src/app/api/public/news/route.ts.
export async function GET() {
  const [festivals, calendar] = await Promise.all([
    festivalsStore.getAll(),
    festivalCalendarStore.get()
  ]);
  return NextResponse.json(
    { success: true, festivals, pdfUrl: calendar?.pdf_url ?? null },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
