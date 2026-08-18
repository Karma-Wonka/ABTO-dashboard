import { festivalsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('festivals:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const festival = await festivalsStore.getById(Number(id));
  if (!festival)
    return NextResponse.json({ success: false, message: 'Festival not found' }, { status: 404 });
  return NextResponse.json({ success: true, festival });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('festivals:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const festival = await festivalsStore.update(Number(id), body);
  if (!festival)
    return NextResponse.json({ success: false, message: 'Festival not found' }, { status: 404 });
  notifyWebRevalidate(['festivals']);
  return NextResponse.json({ success: true, message: 'Festival updated', festival });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('festivals:delete');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const removed = await festivalsStore.remove(Number(id));
  if (!removed)
    return NextResponse.json({ success: false, message: 'Festival not found' }, { status: 404 });
  notifyWebRevalidate(['festivals']);
  return NextResponse.json({ success: true, message: 'Festival deleted' });
}
