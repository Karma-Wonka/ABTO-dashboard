import { submissionsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('submissions:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const removed = await submissionsStore.remove(Number(id));
  if (!removed)
    return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
  return NextResponse.json({ success: true, message: 'Submission deleted' });
}
