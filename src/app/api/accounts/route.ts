// ============================================================
// Route Handler — sign-in accounts (list only)
// ============================================================
// Bridges the gap between the Roles CRUD and reality: without this,
// the only way to assign a custom role to a real account is the
// AUTO_ADMIN_EMAILS bootstrap or direct DB access. Never returns
// password_hash.
// ============================================================
import { authUsersStore } from '@/constants/auth-users';
import { requirePermission } from '@/lib/rbac';
import { NextResponse } from 'next/server';

export async function GET() {
  const gate = await requirePermission('accounts:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const accounts = await authUsersStore.getAll();
  return NextResponse.json({ success: true, accounts });
}
