// ============================================================
// Route Handler — dashboard overview stats
// ============================================================
// Aggregates real members/events/news/documents data for the
// overview cards and charts. Read-only, gated by members:read
// since it exposes region/specialty breakdowns of member data.
// ============================================================
import { getOverviewStats } from '@/constants/overview-data';
import { requirePermission } from '@/lib/rbac';
import { NextResponse } from 'next/server';

export async function GET() {
  const gate = await requirePermission('members:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const stats = await getOverviewStats();
  return NextResponse.json({ success: true, stats });
}
