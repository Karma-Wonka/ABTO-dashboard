import { festivalCalendarStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

// Single-slot resource — the current signed Festival Calendar PDF, uploaded
// via PdfUrlField (POST /api/upload) then saved here.
export async function GET() {
  const gate = await requirePermission('festivals:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const calendar = (await festivalCalendarStore.get()) ?? { pdf_url: null, updated_at: null };
  return NextResponse.json({ success: true, calendar });
}

export async function PUT(request: NextRequest) {
  const gate = await requirePermission('festivals:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const pdf_url = typeof body.pdf_url === 'string' && body.pdf_url ? body.pdf_url : null;
  const calendar = await festivalCalendarStore.set(pdf_url);
  notifyWebRevalidate(['festivals']);
  return NextResponse.json({ success: true, message: 'Festival calendar PDF updated', calendar });
}
