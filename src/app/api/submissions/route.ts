import { submissionsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const gate = await requirePermission('submissions:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const kind = request.nextUrl.searchParams.get('kind') ?? undefined;
  const submissions = await submissionsStore.getAll({ kind });
  return NextResponse.json({ success: true, submissions });
}
