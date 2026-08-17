import { authUsersStore } from '@/constants/auth-users';
import { requirePermission, getCurrentEmail } from '@/lib/rbac';
import { roleAssignmentSchema } from '@/features/accounts/api/types';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('accounts:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = roleAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const target = await authUsersStore.getById(Number(id));
  const currentEmail = await getCurrentEmail();
  if (target && currentEmail && target.email.toLowerCase() === currentEmail) {
    return NextResponse.json(
      { success: false, message: 'You cannot change your own role.' },
      { status: 400 }
    );
  }

  const result = await authUsersStore.updateRole(Number(id), parsed.data.role);
  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  const { id: accId, email, name, role, created_at } = result.user;
  return NextResponse.json({
    success: true,
    message: 'Role updated',
    account: { id: accId, email, name, role, created_at }
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('accounts:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const target = await authUsersStore.getById(Number(id));
  const currentEmail = await getCurrentEmail();
  if (target && currentEmail && target.email.toLowerCase() === currentEmail) {
    return NextResponse.json(
      { success: false, message: 'You cannot delete your own account here — use Profile.' },
      { status: 400 }
    );
  }

  const removed = await authUsersStore.remove(Number(id));
  if (!removed)
    return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
  return NextResponse.json({ success: true, message: 'Account deleted' });
}
