import { permissionsStore } from '@/constants/rbac-data';
import { requirePermission } from '@/lib/rbac';
import { permissionPayloadSchema } from '@/features/permissions/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const permissions = await permissionsStore.getAll();
  return NextResponse.json({ success: true, permissions });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const parsed = permissionPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  try {
    const permission = await permissionsStore.create(parsed.data);
    return NextResponse.json(
      { success: true, message: 'Permission created', permission },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create permission.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
