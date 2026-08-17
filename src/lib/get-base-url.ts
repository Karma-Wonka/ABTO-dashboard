// Server-side fetch (RSC prefetch, route handlers calling other routes) needs
// an absolute URL — the browser can resolve relative paths itself.
export function getBaseUrl() {
  if (typeof window !== 'undefined') return '';

  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}
