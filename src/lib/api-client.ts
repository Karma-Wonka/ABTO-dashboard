import { getBaseUrl } from './get-base-url';

const BASE_URL = '/api';

async function getForwardedCookieHeader(): Promise<string | null> {
  if (typeof window !== 'undefined') return null;
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
}

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cookieHeader = await getForwardedCookieHeader();
  const res = await fetch(`${getBaseUrl()}${BASE_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...options?.headers
    }
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
