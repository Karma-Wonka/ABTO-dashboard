// ============================================================
// Route Handler — Members (list + create)
// ============================================================
// GET is open to any signed-in user (members need to see the directory).
// POST (adding a brand-new operator to the directory) is admin-only —
// a member can edit their OWN row (see [id]/route.ts) but can't create
// new ones.
// ============================================================
import { membersStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { paginateAndSort } from '@/lib/paginate';
import { memberPayloadSchema } from '@/features/members/api/types';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const gate = await requirePermission('members:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);
  const sort = searchParams.get('sort') ?? undefined;

  let all = await membersStore.getAll({ search });
  if (status) {
    const statuses = status.split(',');
    all = all.filter((m) => statuses.includes(m.status));
  }
  const { items, total } = paginateAndSort(all, { page, limit, sort });

  return NextResponse.json({ success: true, members: items, total_members: total });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('members:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const parsed = memberPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const member = await membersStore.create(parsed.data);
  notifyWebRevalidate(['members']);
  return NextResponse.json({ success: true, message: 'Member created', member }, { status: 201 });
}
