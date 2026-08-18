import { randomUUID } from 'crypto';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, R2_BUCKET } from '@/lib/r2';
import { requirePermission } from '@/lib/rbac';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const KEY_PREFIX = 'documents/';

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
}

// Cover images for publications/downloads (src/features/documents) — go to
// the same private R2 bucket as the Festival Calendar PDF, not Vercel Blob
// (BLOB_READ_WRITE_TOKEN isn't configured). ../web resolves the stored key
// to a signed link per request; these images are on a fully public page
// (/publications), so that link just gets a longer expiry than the
// members-only Festival Calendar one.
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
      { success: false, message: 'Unsupported file type. Use JPEG, PNG, WEBP, GIF, or AVIF.' },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: 'File too large. Maximum size is 8MB.' },
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

  return NextResponse.json({ success: true, key, viewUrl }, { status: 201 });
}

// Presigns a short-lived preview link for an already-uploaded image, for
// the admin form's preview when editing a document that already has one.
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
