import { rolesStore } from '@/constants/rbac-data';
import { requirePermission } from '@/lib/rbac';
import { rolePayloadSchema } from '@/features/roles/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const roles = await rolesStore.getAll();
  return NextResponse.json({ success: true, roles });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('roles:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const parsed = rolePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const existing = await rolesStore.getByName(parsed.data.name);
  if (existing) {
    return NextResponse.json(
      { success: false, message: 'A role with this name already exists.' },
      { status: 409 }
    );
  }

  const role = await rolesStore.create(parsed.data);
  return NextResponse.json({ success: true, message: 'Role created', role }, { status: 201 });
}
