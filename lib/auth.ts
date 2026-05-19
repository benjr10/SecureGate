import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import { comparePassword } from './crypto';
import { checkRateLimit } from './rate-limit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid email or password');
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error('Invalid email or password');
        }

        const { email, password } = parsed.data;

        // Apply rate limit check per Email
        const rateLimitKey = `login:email:${email.toLowerCase()}`;
        // Max 5 login attempts within 15 minutes
        const rateLimitResult = await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
        if (!rateLimitResult.success) {
          throw new Error('Too many attempts. Please try again later.');
        }

        // Find user
        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Compare password hashes
        const isValidPassword = await comparePassword(password, user.passwordHash);
        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = (user as any).emailVerified;
      }
      
      if (trigger === 'update' && session) {
        if (session.emailVerified !== undefined) {
          token.emailVerified = session.emailVerified;
        }
      }

      // Sync verified status directly from DB to prevent cached JWT bypasses
      if (token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { emailVerified: true },
        });
        if (dbUser) {
          token.emailVerified = dbUser.emailVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
