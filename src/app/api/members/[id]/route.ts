// ============================================================
// Route Handler — Single Member (get + update + delete)
// ============================================================
// PUT is the self-service path: a signed-in member may edit their OWN
// row (matched by email), anyone with `members:write` may edit any row.
// DELETE requires `members:delete` — a member can't remove their own
// listing this way.
// ============================================================
import { membersStore } from '@/constants/abto-data';
import { requirePermission, requireSelfOrPermission } from '@/lib/rbac';
import { memberPayloadSchema } from '@/features/members/api/types';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('members:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const member = await membersStore.getById(Number(id));
  if (!member)
    return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
  return NextResponse.json({ success: true, member });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await membersStore.getById(Number(id));
  if (!existing)
    return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });

  const gate = await requireSelfOrPermission(existing.email, 'members:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  if (!gate.permissions.includes('members:write')) {
    // A member editing their own row can update contact/specialty details,
    // but not re-assign the row to a different account or change status.
    body.email = existing.email;
    body.status = existing.status;
  }

  const parsed = memberPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const member = await membersStore.update(Number(id), parsed.data);
  notifyWebRevalidate(['members']);
  return NextResponse.json({ success: true, message: 'Member updated', member });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('members:delete');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const removed = await membersStore.remove(Number(id));
  if (!removed)
    return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
  notifyWebRevalidate(['members']);
  return NextResponse.json({ success: true, message: 'Member deleted' });
}
