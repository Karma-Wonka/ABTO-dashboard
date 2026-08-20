import { notificationsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const gate = await requirePermission('submissions:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const ok = await notificationsStore.markRead(Number(id));
  if (!ok)
    return NextResponse.json(
      { success: false, message: 'Notification not found' },
      { status: 404 }
    );
  return NextResponse.json({ success: true });
}
