// ============================================================
// Route Handler — "my" member row
// ============================================================
// Lets the Members page ask "which row (if any) belongs to me?" so it
// can highlight/enable editing on that row for a signed-in member,
// without the client needing to know the matching rule (email match).
// ============================================================
import { membersStore } from '@/constants/abto-data';
import { getCurrentEmail, getRole } from '@/lib/rbac';
import { NextResponse } from 'next/server';

export async function GET() {
  const role = await getRole();
  if (!role)
    return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 });

  const email = await getCurrentEmail();
  const member = email ? await membersStore.getByEmail(email) : undefined;
  return NextResponse.json({ success: true, member: member ?? null });
}
