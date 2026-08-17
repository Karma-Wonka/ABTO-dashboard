import { newsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { paginateAndSort } from '@/lib/paginate';
import { newsPayloadSchema } from '@/features/news/api/types';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const gate = await requirePermission('news:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') ?? undefined;
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);
  const sort = searchParams.get('sort') ?? undefined;

  const all = await newsStore.getAll({ search });
  const { items, total } = paginateAndSort(all, { page, limit, sort });

  return NextResponse.json({ success: true, news: items, total_news: total });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('news:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const parsed = newsPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const post = await newsStore.create(parsed.data);
  notifyWebRevalidate(['news']);
  return NextResponse.json({ success: true, message: 'News post created', post }, { status: 201 });
}
