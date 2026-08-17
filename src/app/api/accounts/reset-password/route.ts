import { authUsersStore } from '@/constants/auth-users';
import { requirePermission } from '@/lib/rbac';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const gate = await requirePermission('accounts:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { email, newPassword } = await request.json();

  if (typeof email !== 'string' || !email) {
    return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return NextResponse.json(
      { success: false, message: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  const ok = await authUsersStore.setPassword(email, newPassword);
  if (!ok) {
    return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Password updated' });
}
