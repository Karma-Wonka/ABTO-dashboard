import { destinationsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('destinations:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const destination = await destinationsStore.getById(Number(id));
  if (!destination)
    return NextResponse.json({ success: false, message: 'Destination not found' }, { status: 404 });
  return NextResponse.json({ success: true, destination });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('destinations:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const destination = await destinationsStore.update(Number(id), body);
  if (!destination)
    return NextResponse.json({ success: false, message: 'Destination not found' }, { status: 404 });
  notifyWebRevalidate(['destinations']);
  return NextResponse.json({ success: true, message: 'Destination updated', destination });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('destinations:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const removed = await destinationsStore.remove(Number(id));
  if (!removed)
    return NextResponse.json({ success: false, message: 'Destination not found' }, { status: 404 });
  notifyWebRevalidate(['destinations']);
  return NextResponse.json({ success: true, message: 'Destination deleted' });
}
