import { committeeStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('committee:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const member = await committeeStore.getById(Number(id));
  if (!member)
    return NextResponse.json(
      { success: false, message: 'Committee seat not found' },
      { status: 404 }
    );
  return NextResponse.json({ success: true, member });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('committee:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const member = await committeeStore.update(Number(id), body);
  if (!member)
    return NextResponse.json(
      { success: false, message: 'Committee seat not found' },
      { status: 404 }
    );
  notifyWebRevalidate(['committee']);
  return NextResponse.json({ success: true, message: 'Committee seat updated', member });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('committee:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const removed = await committeeStore.remove(Number(id));
  if (!removed)
    return NextResponse.json(
      { success: false, message: 'Committee seat not found' },
      { status: 404 }
    );
  notifyWebRevalidate(['committee']);
  return NextResponse.json({ success: true, message: 'Committee seat deleted' });
}
