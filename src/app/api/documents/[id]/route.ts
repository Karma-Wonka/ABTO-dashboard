import { documentsStore } from '@/constants/abto-data';
import { requirePermission } from '@/lib/rbac';
import { documentPayloadSchema } from '@/features/documents/api/types';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('documents:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const document = await documentsStore.getById(Number(id));
  if (!document)
    return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
  return NextResponse.json({ success: true, document });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('documents:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = documentPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const document = await documentsStore.update(Number(id), parsed.data);
  if (!document)
    return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
  return NextResponse.json({ success: true, message: 'Document updated', document });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requirePermission('documents:delete');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const { id } = await params;
  const removed = await documentsStore.remove(Number(id));
  if (!removed)
    return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
  return NextResponse.json({ success: true, message: 'Document deleted' });
}
