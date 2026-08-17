import { siteContentStore } from '@/constants/site-content';
import { requirePermission } from '@/lib/rbac';
import { notifyWebRevalidate } from '@/lib/revalidate';
import { NextRequest, NextResponse } from 'next/server';

// Public and unauthenticated on purpose: this is the same marketing copy
// shown to every visitor of the public site (../web), fetched cross-origin/
// server-side. No PII, no writes. Also still used by the legacy
// abto-website.html static prototype, which has no backend of its own.
export async function GET() {
  const content = await siteContentStore.getAll();
  return NextResponse.json(
    { success: true, content },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}

export async function PUT(request: NextRequest) {
  const gate = await requirePermission('site-content:manage');
  if (!gate.ok)
    return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });

  const patch = await request.json();
  const content = await siteContentStore.update(patch);
  notifyWebRevalidate(['site-content']);
  return NextResponse.json({ success: true, content });
}
