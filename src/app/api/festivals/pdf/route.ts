import { randomUUID } from 'crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { festivalCalendarStore } from '@/constants/abto-data';
import { getR2Client, R2_BUCKET } from '@/lib/r2';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const KEY_PREFIX = 'Festival Calender/';

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
}

async function signViewUrl(key: string) {
  return getSignedUrl(getR2Client(), new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), {
    expiresIn: 300
  });
}

// Single-slot resource — the current signed Festival Calendar PDF, stored
// as an R2 object key (private bucket, see src/lib/r2.ts). GET returns a
// short-lived presigned link for the admin's own "View current PDF"; ../web
// generates its own separately, gated on a member session instead of an
// admin one.
export async function GET() {
  const gate = await requirePermission('festivals:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const calendar = await festivalCalendarStore.get();
  const viewUrl = calendar?.pdf_key ? await signViewUrl(calendar.pdf_key) : null;
  return NextResponse.json({
    success: true,
    calendar: {
      pdf_key: calendar?.pdf_key ?? null,
      updated_at: calendar?.updated_at ?? null,
      viewUrl
    }
  });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('festivals:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json(
      { success: false, message: 'Please choose a PDF file.' },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: 'File too large. Maximum size is 8MB.' },
      { status: 400 }
    );
  }

  const previous = await festivalCalendarStore.get();
  const key = `${KEY_PREFIX}${Date.now()}-${randomUUID()}-${sanitizeName(file.name)}`;
  const body = new Uint8Array(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: file.type })
  );

  const calendar = await festivalCalendarStore.set(key);

  if (previous?.pdf_key) {
    await getR2Client()
      .send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: previous.pdf_key }))
      .catch(() => {});
  }

  notifyWebRevalidate(['festivals']);
  const viewUrl = await signViewUrl(key);
  return NextResponse.json({
    success: true,
    message: 'Festival calendar PDF uploaded',
    calendar: { ...calendar, viewUrl }
  });
}

export async function DELETE() {
  const gate = await requirePermission('festivals:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const previous = await festivalCalendarStore.get();
  await festivalCalendarStore.set(null);

  if (previous?.pdf_key) {
    await getR2Client()
      .send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: previous.pdf_key }))
      .catch(() => {});
  }

  notifyWebRevalidate(['festivals']);
  return NextResponse.json({ success: true, message: 'Festival calendar PDF removed' });
}
