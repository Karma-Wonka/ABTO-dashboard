import 'server-only';

/**
 * Tells the public site (../ABTO-web) to drop its cached homepage so
 * member/event/news/document edits made here show up there. Best-effort —
 * never throws, since a failed webhook shouldn't fail the mutation that
 * triggered it.
 */
export function notifyWebRevalidate() {
  const base = process.env.WEB_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret) return;

  fetch(`${base}/api/revalidate`, {
    method: 'POST',
    headers: { 'x-revalidate-secret': secret }
  }).catch(() => {
    // Public site may be down or not deployed yet — ignore.
  });
}
