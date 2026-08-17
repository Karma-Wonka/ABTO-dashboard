'use client';

import { useSession } from 'next-auth/react';

/**
 * Client-side role/permission lookup. Purely for UX (hide/disable
 * buttons) — every write endpoint re-checks server-side via
 * `requirePermission`/`requireSelfOrPermission`, so nothing here is a
 * security boundary.
 */
export function useRole() {
  const { data, status } = useSession();
  const permissions = data?.user?.permissions ?? [];

  return {
    role: data?.user?.role ?? null,
    email: data?.user?.email ?? null,
    permissions,
    can: (permission: string) => permissions.includes(permission),
    isAdmin: data?.user?.role === 'Admin',
    isLoading: status === 'loading'
  };
}
