import { notificationsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { NextResponse } from 'next/server';

export async function POST() {
  const gate = await requirePermission('submissions:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  await notificationsStore.markAllRead();
  return NextResponse.json({ success: true });
}
