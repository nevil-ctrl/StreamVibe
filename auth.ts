import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';

import { prisma } from './lib/prisma';
import { Role } from '@/types/role';

function isBanActive(isBanned: boolean, banExpiresAt: Date | null) {
  if (!isBanned) return false;
  if (!banExpiresAt) return true;
  return banExpiresAt > new Date();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.password) return null;

        const ok = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!ok) return null;

        if (isBanActive(user.isBanned, user.banExpiresAt)) {
          throw new Error('ACCOUNT_BANNED');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isBanned: user.isBanned,
          banExpiresAt: user.banExpiresAt,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user?.id) return false;
      if (account?.provider !== 'credentials') return true;

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { isBanned: true, banExpiresAt: true },
      });
      if (!dbUser) return true;

      return !isBanActive(dbUser.isBanned, dbUser.banExpiresAt);
    },

    async jwt({ token, user }) {
      // Первый вход — записываем данные из user
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isBanned = user.isBanned;
        token.banExpiresAt = user.banExpiresAt ?? null;
        token.picture = user.image;
        token._lastRefresh = Date.now();
        return token;
      }

      // Обновляем раз в 5 минут
      const REFRESH_INTERVAL = 5 * 60 * 1000;
      const lastRefresh = (token._lastRefresh as number) ?? 0;
      if (Date.now() - lastRefresh < REFRESH_INTERVAL) return token;

      const userId = (token.id as string) || token.sub;
      if (!userId) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, isBanned: true, banExpiresAt: true, image: true },
      });
      if (!dbUser) return token;

      token.id = userId;
      token.role = dbUser.role;
      token.isBanned = isBanActive(dbUser.isBanned, dbUser.banExpiresAt);
      token.banExpiresAt = dbUser.banExpiresAt ?? null;
      token.picture = dbUser.image;
      token._lastRefresh = Date.now();

      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = token.id as string;
      session.user.role = (token.role as Role) ?? Role.USER;
      session.user.isBanned = (token.isBanned as boolean) ?? false;
      session.user.banExpiresAt = (token.banExpiresAt as Date | null) ?? null;
      session.user.image = (token.picture as string) ?? null;

      return session;
    },
  },
});
