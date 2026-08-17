import { destinationsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const gate = await requirePermission('destinations:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const search = request.nextUrl.searchParams.get('search') ?? undefined;
  const kind = request.nextUrl.searchParams.get('kind') ?? undefined;
  const destinations = await destinationsStore.getAll({ search, kind });
  return NextResponse.json({ success: true, destinations });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('destinations:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const destination = await destinationsStore.create(body);
  notifyWebRevalidate(['destinations']);
  return NextResponse.json(
    { success: true, message: 'Destination created', destination },
    { status: 201 }
  );
}
