import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role?: string;
      permissions?: string[];
    } & DefaultSession['user'];
  }
  interface User {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string | null;
    permissions?: string[];
    roleCheckedAt?: number;
  }
}
