// ============================================================
// On-demand revalidation webhook — server-only
// ============================================================
// After any successful write to public-facing content (news, events,
// members, site-content, committee, destinations...), call this so the
// public website (web/) drops its cache for the affected tag(s) right
// away instead of waiting out its time-based revalidate window. This is
// fire-and-forget: a missed/slow webhook only means the site catches up
// on its own next revalidate tick, so it must never fail the admin
// request that triggered it.
// ============================================================
import 'server-only';

export function notifyWebRevalidate(tags: string[]): void {
  const url = process.env.WEB_REVALIDATE_URL;
  if (!url) return;

  fetch(`${url}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidate-secret': process.env.REVALIDATE_SECRET ?? ''
    },
    body: JSON.stringify({ tags })
  }).catch(() => {
    // Best-effort — the public site's own time-based revalidate is the fallback.
  });
}
