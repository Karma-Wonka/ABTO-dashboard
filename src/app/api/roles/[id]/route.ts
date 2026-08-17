import { rolesStore } from '@/constants/rbac-data';
import { requirePermission } from '@/lib/rbac';
import { rolePayloadSchema } from '@/features/roles/api/types';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const role = await rolesStore.getById(Number(id));
  if (!role)
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  return NextResponse.json({ success: true, role });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = rolePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  try {
    const role = await rolesStore.update(Number(id), parsed.data);
    if (!role)
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Role updated', role });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update role.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const result = await rolesStore.remove(Number(id));
  if (result === 'system') {
    return NextResponse.json(
      { success: false, message: 'System roles cannot be deleted.' },
      { status: 400 }
    );
  }
  if (!result)
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  return NextResponse.json({ success: true, message: 'Role deleted' });
}
