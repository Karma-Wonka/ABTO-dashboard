import { festivalsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const gate = await requirePermission('festivals:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const search = request.nextUrl.searchParams.get('search') ?? undefined;
  const festivals = await festivalsStore.getAll({ search });
  return NextResponse.json({ success: true, festivals });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('festivals:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const festival = await festivalsStore.create(body);
  notifyWebRevalidate(['festivals']);
  return NextResponse.json(
    { success: true, message: 'Festival created', festival },
    { status: 201 }
  );
}
