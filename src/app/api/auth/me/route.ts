// ============================================================
// Route Handler — "my" account (update name)
// ============================================================
import { authUsersStore } from '@/constants/auth-users';
import { getRole, getCurrentEmail } from '@/lib/rbac';
import { nameSchema } from '@/features/profile/schemas/profile';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const role = await getRole();
  if (!role)
    return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 });

  const email = await getCurrentEmail();
  const account = email ? await authUsersStore.getByEmail(email) : undefined;
  if (!account)
    return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });

  const body = await request.json();
  const parsed = nameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const updated = await authUsersStore.updateName(account.id, parsed.data.name);
  return NextResponse.json({ success: true, message: 'Profile updated', name: updated?.name });
}
