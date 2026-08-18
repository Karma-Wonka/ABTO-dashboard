import { put } from '@vercel/blob';
import { requirePermission } from '@/lib/rbac';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'application/pdf'
];

// Admin-only — uploads a single file to Vercel Blob and returns its public
// URL. Used by the ImageUrlField form component (see
// src/components/forms/fields/image-url-field.tsx) wherever an admin can
// set an image on the public site (hero banners, committee photos,
// destination photos, news hero images), and by PdfUrlField (see
// src/components/forms/fields/pdf-url-field.tsx) for uploaded PDFs like the
// Event Calendar (src/features/documents).
export async function POST(request: NextRequest) {
  const gate = await requirePermission('media:upload');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: 'Unsupported file type. Use JPEG, PNG, WEBP, GIF, AVIF, or PDF.' },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: 'File too large. Maximum size is 8MB.' },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true
    });
    return NextResponse.json({ success: true, url: blob.url });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
