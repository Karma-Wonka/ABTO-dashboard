// ============================================================
// Route Handler — account registration (Credentials sign-up)
// ============================================================
// Creates the auth_users row; the client signs the user in with
// next-auth's signIn('credentials', ...) right after this succeeds.
// ============================================================
import { authUsersStore } from '@/constants/auth-users';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, message: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : undefined;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, message: 'Enter a valid email address.' },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { success: false, message: 'Password must be at least 8 characters.' },
      { status: 400 }
    );
  }

  try {
    const user = await authUsersStore.create(email, password, name);
    return NextResponse.json({ success: true, email: user.email }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create account.';
    return NextResponse.json({ success: false, message }, { status: 409 });
  }
}
