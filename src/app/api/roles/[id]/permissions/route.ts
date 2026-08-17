import { rolesStore } from '@/constants/rbac-data';
import { requirePermission } from '@/lib/rbac';
import { setPermissionsPayloadSchema } from '@/features/roles/api/types';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = setPermissionsPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const role = await rolesStore.setPermissions(Number(id), parsed.data.permissions);
  if (!role)
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  return NextResponse.json({ success: true, message: 'Permissions updated', role });
}
