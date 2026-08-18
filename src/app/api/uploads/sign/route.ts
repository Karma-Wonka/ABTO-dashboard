import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, R2_BUCKET } from '@/lib/r2';
import { requirePermission } from '@/lib/rbac';
import { NextRequest, NextResponse } from 'next/server';

// Membership application documents (licence scans, fee deposit slips) live
// in a private R2 bucket — the Submissions viewer calls this to get a
// short-lived link instead of ever storing a public URL. Same permission
// gate as GET /api/submissions.
export async function GET(request: NextRequest) {
  const gate = await requirePermission('submissions:read');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const key = request.nextUrl.searchParams.get('key');
  if (!key || !key.startsWith('Members/')) {
    return NextResponse.json({ success: false, message: 'Invalid key.' }, { status: 400 });
  }

  try {
    const url = await getSignedUrl(
      getR2Client(),
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
      { expiresIn: 300 }
    );
    return NextResponse.json({ success: true, url });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Could not sign URL.' },
      { status: 500 }
    );
  }
}
