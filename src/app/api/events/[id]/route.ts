import { eventsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { eventPayloadSchema } from '@/features/events/api/types';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('events:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const event = await eventsStore.getById(Number(id));
  if (!event)
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  return NextResponse.json({ success: true, event });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('events:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = eventPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const event = await eventsStore.update(Number(id), parsed.data);
  if (!event)
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  notifyWebRevalidate(['events']);
  return NextResponse.json({ success: true, message: 'Event updated', event });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('events:delete');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const removed = await eventsStore.remove(Number(id));
  if (!removed)
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  notifyWebRevalidate(['events']);
  return NextResponse.json({ success: true, message: 'Event deleted' });
}
