import { randomUUID } from 'crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { festivalCalendarStore, type FestivalCalendarSlot } from '@/constants/abto-data';
import { getR2Client, R2_BUCKET } from '@/lib/r2';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const KEY_PREFIX = 'Festival Calender/';

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
}

function parseSlot(request: NextRequest): FestivalCalendarSlot | null {
  const raw = request.nextUrl.searchParams.get('slot') ?? '1';
  return raw === '1' || raw === '2' ? (Number(raw) as FestivalCalendarSlot) : null;
}

async function signViewUrl(key: string) {
  return getSignedUrl(getR2Client(), new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), {
    expiresIn: 300
  });
}

// Two-slot resource — the signed Festival Calendar PDFs for the current
// year (slot 1) and next year (slot 2), each stored as an R2 object key
// (private bucket, see src/lib/r2.ts). GET returns short-lived presigned
// links for the admin's own "View current PDF"; ../web generates its own
// separately, gated on a member session instead of an admin one.
export async function GET() {
  const gate = await requirePermission('festivals:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const calendar = await festivalCalendarStore.get();
  const [currentYearViewUrl, nextYearViewUrl] = await Promise.all([
    calendar?.pdf_key ? signViewUrl(calendar.pdf_key) : null,
    calendar?.pdf_key_2 ? signViewUrl(calendar.pdf_key_2) : null
  ]);
  return NextResponse.json({
    success: true,
    calendar: {
      currentYear: {
        pdf_key: calendar?.pdf_key ?? null,
        updated_at: calendar?.updated_at ?? null,
        viewUrl: currentYearViewUrl
      },
      nextYear: {
        pdf_key: calendar?.pdf_key_2 ?? null,
        updated_at: calendar?.updated_at_2 ?? null,
        viewUrl: nextYearViewUrl
      }
    }
  });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermission('festivals:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const slot = parseSlot(request);
  if (!slot) {
    return NextResponse.json({ success: false, message: 'Invalid slot.' }, { status: 400 });
  }

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
  const previousKey = slot === 1 ? previous?.pdf_key : previous?.pdf_key_2;
  const key = `${KEY_PREFIX}${Date.now()}-${randomUUID()}-${sanitizeName(file.name)}`;
  const body = new Uint8Array(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: file.type })
  );

  const result = await festivalCalendarStore.set(slot, key);

  if (previousKey) {
    await getR2Client()
      .send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: previousKey }))
      .catch(() => {});
  }

  notifyWebRevalidate(['festivals']);
  const viewUrl = await signViewUrl(key);
  return NextResponse.json({
    success: true,
    message: 'Festival calendar PDF uploaded',
    slot: { ...result, viewUrl }
  });
}

export async function DELETE(request: NextRequest) {
  const gate = await requirePermission('festivals:write');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const slot = parseSlot(request);
  if (!slot) {
    return NextResponse.json({ success: false, message: 'Invalid slot.' }, { status: 400 });
  }

  const previous = await festivalCalendarStore.get();
  const previousKey = slot === 1 ? previous?.pdf_key : previous?.pdf_key_2;
  await festivalCalendarStore.set(slot, null);

  if (previousKey) {
    await getR2Client()
      .send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: previousKey }))
      .catch(() => {});
  }

  notifyWebRevalidate(['festivals']);
  return NextResponse.json({ success: true, message: 'Festival calendar PDF removed' });
}
