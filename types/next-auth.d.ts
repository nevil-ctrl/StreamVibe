import { type DefaultSession } from 'next-auth';
import { type JWT as DefaultJWT } from 'next-auth/jwt';
import { type AdapterUser as BaseAdapterUser } from '@auth/core/adapters';
import { type Role } from '@/types/role';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      isBanned: boolean;
      banExpiresAt: Date | null;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    role?: Role;
    isBanned?: boolean;
    banExpiresAt?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: Role;
    isBanned?: boolean;
    banExpiresAt?: Date | null;
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser extends BaseAdapterUser {
    role?: Role;
    isBanned?: boolean;
    banExpiresAt?: Date | null;
  }
}
