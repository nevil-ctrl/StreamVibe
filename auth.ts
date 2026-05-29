import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';
import { Role } from '@prisma/client';

// Отключаем строгую проверку TLS для локальной разработки
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// ВСЕ типы для Auth.js v5 расширяем строго в ОДНОМ модуле 'next-auth'
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: Role;
  }

  // В Auth.js v5 интерфейс JWT расширяется прямо здесь!
  interface JWT {
    id?: string;
    role?: Role;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  debug: true,
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValidPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: Role.USER,
            },
          });

          user.id = newUser.id;
          user.role = newUser.role;
        } else {
          user.id = existingUser.id;
          user.role = existingUser.role;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
        token.role = user.role;
      }

      if (trigger === 'update') {
        if (session?.image) {
          token.picture = session.image;
        } else if (session?.user?.image) {
          token.picture = session.user.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.image = token.picture as string;

        // Надежное приведение типа, чтобы TS не ругался на {}
        if (token.role === Role.ADMIN || token.role === Role.USER) {
          session.user.role = token.role;
        } else {
          session.user.role = Role.USER; // Дефолтное безопасное значение
        }
      }
      return session;
    },
  },
});
