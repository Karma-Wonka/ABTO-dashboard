// ============================================================
// Route Handler — change my own password
// ============================================================
import { authUsersStore } from '@/constants/auth-users';
import { getRole, getCurrentEmail } from '@/lib/rbac';
import { checkRateLimit } from '@/lib/rate-limit';
import { passwordPayloadSchema } from '@/features/profile/schemas/profile';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const role = await getRole();
  if (!role)
    return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 });

  const email = await getCurrentEmail();
  const account = email ? await authUsersStore.getByEmail(email) : undefined;
  if (!account)
    return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });

  if (!checkRateLimit(`change-password:${account.id}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, message: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = passwordPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const result = await authUsersStore.updatePassword(account.id, parsed.data.newPassword);
  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Password updated' });
}
