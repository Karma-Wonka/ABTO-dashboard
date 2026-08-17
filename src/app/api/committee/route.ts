import { committeeStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const gate = await requirePermission('committee:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const search = request.nextUrl.searchParams.get('search') ?? undefined;
  const committee = await committeeStore.getAll({ search });
  return NextResponse.json({ success: true, committee });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('committee:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const member = await committeeStore.create(body);
  notifyWebRevalidate(['committee']);
  return NextResponse.json(
    { success: true, message: 'Committee seat created', member },
    { status: 201 }
  );
}
