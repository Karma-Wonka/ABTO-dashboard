import { newsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { newsPayloadSchema } from '@/features/news/api/types';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('news:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const post = await newsStore.getById(Number(id));
  if (!post)
    return NextResponse.json({ success: false, message: 'News post not found' }, { status: 404 });
  return NextResponse.json({ success: true, post });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('news:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = newsPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const post = await newsStore.update(Number(id), parsed.data);
  if (!post)
    return NextResponse.json({ success: false, message: 'News post not found' }, { status: 404 });
  notifyWebRevalidate(['news']);
  return NextResponse.json({ success: true, message: 'News post updated', post });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('news:delete');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const removed = await newsStore.remove(Number(id));
  if (!removed)
    return NextResponse.json({ success: false, message: 'News post not found' }, { status: 404 });
  notifyWebRevalidate(['news']);
  return NextResponse.json({ success: true, message: 'News post deleted' });
}
