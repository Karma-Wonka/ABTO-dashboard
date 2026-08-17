// ============================================================
// NextAuth (Auth.js v5) config — Credentials provider only
// ============================================================
// JWT sessions (no database session table needed) with `role` and
// `permissions` embedded via the jwt/session callbacks. `role` comes
// from src/constants/auth-users.ts; `permissions` is the permission-key
// list attached to that role in src/constants/rbac-data.ts. Both are
// re-checked periodically so a role rename, a role's permission set
// changing, or an account being removed takes effect without waiting
// out the full session lifetime.
// ============================================================
import NextAuth from 'next-auth';
import { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authUsersStore } from '@/constants/auth-users';
import { getPermissionsForRole } from '@/constants/rbac-data';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

class RateLimitedSignin extends CredentialsSignin {
  code = 'rate_limited';
}

const ROLE_RECHECK_INTERVAL_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/sign-in' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const ip = getClientIp(request);
        if (!checkRateLimit(`signin:${email.toLowerCase()}:${ip}`, 10, 15 * 60 * 1000)) {
          throw new RateLimitedSignin();
        }

        const user = await authUsersStore.verifyPassword(email, password);
        if (!user) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? undefined,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      const now = Date.now();

      if (user) {
        token.role = user.role;
        token.permissions = await getPermissionsForRole(user.role);
        token.roleCheckedAt = now;
        return token;
      }

      // Client called useSession().update({ name }) right after a profile
      // edit — reflect it immediately instead of waiting for the next
      // periodic re-check below.
      if (trigger === 'update' && session && typeof session.name === 'string') {
        token.name = session.name;
        return token;
      }

      // Re-check role + permissions against the DB periodically — covers
      // a role rename, an account's role being changed, an account being
      // removed, or the role's permission set being edited.
      const checkedAt = typeof token.roleCheckedAt === 'number' ? token.roleCheckedAt : 0;
      if (token.sub && now - checkedAt > ROLE_RECHECK_INTERVAL_MS) {
        const current = await authUsersStore.getById(Number(token.sub));
        token.role = current?.role ?? null;
        token.permissions = current ? await getPermissionsForRole(current.role) : [];
        token.roleCheckedAt = now;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.role) {
        session.user.role = token.role as string;
        session.user.permissions = (token.permissions ?? []) as string[];
      }
      return session;
    }
  }
});
