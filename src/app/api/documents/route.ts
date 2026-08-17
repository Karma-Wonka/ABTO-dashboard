import { documentsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { paginateAndSort } from '@/lib/paginate';
import { documentPayloadSchema } from '@/features/documents/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const gate = await requirePermission('documents:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') ?? undefined;
  const kind = searchParams.get('kind') ?? undefined;
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);
  const sort = searchParams.get('sort') ?? undefined;

  let all = await documentsStore.getAll({ search });
  if (kind) {
    const kinds = kind.split(',');
    all = all.filter((d) => kinds.includes(d.kind));
  }
  const { items, total } = paginateAndSort(all, { page, limit, sort });

  return NextResponse.json({ success: true, documents: items, total_documents: total });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('documents:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const body = await request.json();
  const parsed = documentPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const document = await documentsStore.create(parsed.data);
  return NextResponse.json(
    { success: true, message: 'Document created', document },
    { status: 201 }
  );
}
