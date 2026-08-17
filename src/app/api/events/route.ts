import { eventsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { paginateAndSort } from '@/lib/paginate';
import { eventPayloadSchema } from '@/features/events/api/types';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const gate = await requirePermission('events:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') ?? undefined;
  const type = searchParams.get('type') ?? undefined;
  const isPast = searchParams.get('is_past') ?? undefined;
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);
  const sort = searchParams.get('sort') ?? undefined;

  let all = await eventsStore.getAll({ search });
  if (type) {
    const types = type.split(',');
    all = all.filter((e) => types.includes(e.type));
  }
  if (isPast) {
    const values = isPast.split(',').map(Number);
    all = all.filter((e) => values.includes(e.is_past));
  }
  const { items, total } = paginateAndSort(all, { page, limit, sort });

  return NextResponse.json({ success: true, events: items, total_events: total });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('events:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const parsed = eventPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const event = await eventsStore.create(parsed.data);
  notifyWebRevalidate(['events']);
  return NextResponse.json({ success: true, message: 'Event created', event }, { status: 201 });
}
