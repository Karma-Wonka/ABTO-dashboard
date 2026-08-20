import { notificationsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { NextResponse } from 'next/server';

// Shared/global inbox (not per-user) for things needing admin attention —
// currently just new submissions. See notificationsStore in abto-data.ts.
export async function GET() {
  const gate = await requirePermission('submissions:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const [notifications, unreadCount] = await Promise.all([
    notificationsStore.getAll(),
    notificationsStore.getUnreadCount()
  ]);
  return NextResponse.json({ success: true, notifications, unreadCount });
}
