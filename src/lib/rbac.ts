// ============================================================
// Access control — server-only
// ============================================================
// Roles are dynamic rows (src/constants/rbac-data.ts) an admin can
// create/edit/delete, each carrying a set of permission keys. The
// session JWT embeds the current user's role name and permission list
// (refreshed periodically — see src/lib/auth.ts), so route guards here
// check permission KEYS, not role names. "Admin" and "Member" are just
// the two seeded roles; a custom role with `members:write` can edit
// members without needing to literally be called "admin".
// ============================================================
import 'server-only';
import { auth } from '@/lib/auth';

async function getSession() {
  const session = await auth();
  return {
    role: session?.user?.role ?? null,
    email: session?.user?.email?.toLowerCase() ?? null,
    permissions: session?.user?.permissions ?? []
  };
}

export async function getRole(): Promise<string | null> {
  return (await getSession()).role;
}

export async function getCurrentEmail(): Promise<string | null> {
  return (await getSession()).email;
}

export async function getPermissions(): Promise<string[]> {
  return (await getSession()).permissions;
}

type Gate =
  | { ok: true; role: string; email: string | null; permissions: string[] }
  | { ok: false; status: 401 | 403; message: string };

/** Route-handler guard: require the caller to be signed in and hold `permission`. */
export async function requirePermission(permission: string): Promise<Gate> {
  const { role, email, permissions } = await getSession();
  if (!role) return { ok: false, status: 401, message: 'Sign in required' };
  if (!permissions.includes(permission)) {
    return { ok: false, status: 403, message: 'You do not have permission to do that.' };
  }
  return { ok: true, role, email, permissions };
}

/** Route-handler guard: just require sign-in, any role. */
export async function requireSignedIn(): Promise<Gate> {
  const { role, email, permissions } = await getSession();
  if (!role) return { ok: false, status: 401, message: 'Sign in required' };
  return { ok: true, role, email, permissions };
}

/** Route-handler guard: require `permission`, OR ownership of `resourceEmail`. */
export async function requireSelfOrPermission(
  resourceEmail: string | null | undefined,
  permission: string
): Promise<Gate> {
  const { role, email, permissions } = await getSession();
  if (!role || !email) return { ok: false, status: 401, message: 'Sign in required' };
  if (permissions.includes(permission)) return { ok: true, role, email, permissions };
  if (resourceEmail && resourceEmail.toLowerCase() === email) {
    return { ok: true, role, email, permissions };
  }
  return { ok: false, status: 403, message: 'You can only edit your own listing' };
}
