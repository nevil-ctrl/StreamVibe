import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';

import { prisma, withRetry } from './lib/prisma';
import { hasActiveSubscription } from './lib/subscription';
import { Role } from '@/types/role';

const JWT_REFRESH_INTERVAL_MS = 30 * 60 * 1000;

function isBanActive(isBanned: boolean, banExpiresAt: Date | null) {
  if (!isBanned) return false;
  if (!banExpiresAt) return true;
  return banExpiresAt > new Date();
}

const subscriptionSelect = {
  subscription: { select: { status: true, expiresAt: true } },
} as const;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
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
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            role: true,
            isBanned: true,
            banExpiresAt: true,
            emailVerified: true,
            ...subscriptionSelect,
          },
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

        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isBanned: user.isBanned,
          banExpiresAt: user.banExpiresAt,
          hasActiveSubscription: hasActiveSubscription(user.subscription),
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user?.id) return false;
      if (account?.provider === 'credentials') return true;

      const dbUser = await withRetry(
        () =>
          prisma.user.findUnique({
            where: { id: user.id },
            select: { isBanned: true, banExpiresAt: true, emailVerified: true },
          }),
        2,
      );
      if (!dbUser) return true;

      if (isBanActive(dbUser.isBanned, dbUser.banExpiresAt)) return false;
      if (!dbUser.emailVerified) return false;

      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isBanned = user.isBanned;
        token.banExpiresAt = user.banExpiresAt ?? null;
        token.picture = user.image;
        token._lastRefresh = Date.now();

        if (typeof user.hasActiveSubscription === 'boolean') {
          token.hasActiveSubscription = user.hasActiveSubscription;
        } else {
          const dbUser = await withRetry(
            () =>
              prisma.user.findUnique({
                where: { id: user.id as string },
                select: subscriptionSelect,
              }),
            2,
          );
          token.hasActiveSubscription = hasActiveSubscription(
            dbUser?.subscription ?? null,
          );
        }

        return token;
      }

      const forceRefresh = trigger === 'update';
      const lastRefresh = (token._lastRefresh as number) ?? 0;
      if (!forceRefresh && Date.now() - lastRefresh < JWT_REFRESH_INTERVAL_MS) {
        return token;
      }

      const userId = (token.id as string) || token.sub;
      if (!userId) return token;

      try {
        const dbUser = await withRetry(
          () =>
            prisma.user.findUnique({
              where: { id: userId },
              select: {
                role: true,
                isBanned: true,
                banExpiresAt: true,
                image: true,
                ...subscriptionSelect,
              },
            }),
          2,
        );
        if (!dbUser) return token;

        token.id = userId;
        token.role = dbUser.role;
        token.isBanned = isBanActive(dbUser.isBanned, dbUser.banExpiresAt);
        token.banExpiresAt = dbUser.banExpiresAt ?? null;
        token.picture = dbUser.image;
        token.hasActiveSubscription = hasActiveSubscription(dbUser.subscription);
        token._lastRefresh = Date.now();
      } catch (err) {
        console.error('JWT refresh DB query failed, using cached token:', err);
        // Return stale token rather than crashing with 500
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = token.id as string;
      session.user.role = (token.role as Role) ?? Role.USER;
      session.user.isBanned = (token.isBanned as boolean) ?? false;
      session.user.banExpiresAt = (token.banExpiresAt as Date | null) ?? null;
      session.user.image = (token.picture as string) ?? null;
      session.user.hasActiveSubscription =
        (token.hasActiveSubscription as boolean) ?? false;

      return session;
    },
  },
});
