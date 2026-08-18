import { randomUUID } from 'crypto';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, R2_BUCKET } from '@/lib/r2';
import { requirePermission } from '@/lib/rbac';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE_BYTES = 16 * 1024 * 1024; // 16MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed'
];
const KEY_PREFIX = 'Publication and Downloads/';

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
}

// The actual downloadable file for a Download/Publication document (as
// opposed to a publication's cover image — see ../image/route.ts). Same
// private R2 bucket, its own prefix. ../web resolves the stored key to a
// signed link per request; both /downloads and /publications are fully
// public pages, so no session check on that side either.
export async function POST(request: NextRequest) {
  const gate = await requirePermission('documents:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: 'Unsupported file type. Use PDF, DOC, DOCX, or ZIP.' },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: 'File too large. Maximum size is 16MB.' },
      { status: 400 }
    );
  }

  const key = `${KEY_PREFIX}${Date.now()}-${randomUUID()}-${sanitizeName(file.name)}`;
  const body = new Uint8Array(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: file.type })
  );

  const viewUrl = await getSignedUrl(
    getR2Client(),
    new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
    { expiresIn: 300 }
  );

  return NextResponse.json(
    { success: true, key, name: file.name, size: file.size, viewUrl },
    { status: 201 }
  );
}

// Presigns a short-lived preview link for an already-uploaded file, for the
// admin form's "View current file" when editing a document that has one.
export async function GET(request: NextRequest) {
  const gate = await requirePermission('documents:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const key = request.nextUrl.searchParams.get('key');
  if (!key || !key.startsWith(KEY_PREFIX)) {
    return NextResponse.json({ success: false, message: 'Invalid key.' }, { status: 400 });
  }

  const viewUrl = await getSignedUrl(
    getR2Client(),
    new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
    { expiresIn: 300 }
  );
  return NextResponse.json({ success: true, viewUrl });
}
