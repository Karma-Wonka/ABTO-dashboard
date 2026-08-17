import { permissionsStore } from '@/constants/rbac-data';
import { requirePermission } from '@/lib/rbac';
import { permissionPayloadSchema } from '@/features/permissions/api/types';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const permission = await permissionsStore.getById(Number(id));
  if (!permission)
    return NextResponse.json({ success: false, message: 'Permission not found' }, { status: 404 });
  return NextResponse.json({ success: true, permission });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = permissionPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  try {
    const permission = await permissionsStore.update(Number(id), parsed.data);
    if (!permission)
      return NextResponse.json(
        { success: false, message: 'Permission not found' },
        { status: 404 }
      );
    return NextResponse.json({ success: true, message: 'Permission updated', permission });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update permission.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const result = await permissionsStore.remove(Number(id));
  if (result === 'system') {
    return NextResponse.json(
      { success: false, message: 'System permissions cannot be deleted.' },
      { status: 400 }
    );
  }
  if (!result)
    return NextResponse.json({ success: false, message: 'Permission not found' }, { status: 404 });
  return NextResponse.json({ success: true, message: 'Permission deleted' });
}
