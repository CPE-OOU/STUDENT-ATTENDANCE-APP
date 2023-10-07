import NextAuth, { NextAuthOptions } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/config/db/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import { users } from '@/config/db/schema';
import { eq } from 'drizzle-orm';

const options: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { type: 'email', label: 'email' },
        password: { type: 'password', label: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.email && credentials.password) {
          throw new Error('Invalid login credential');
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials!.email));

        if (!user) {
          throw Error('User credential not a match. Check email or password');
        }

        return user;
      },
    }),
  ],

  session: { strategy: 'jwt' },
  jwt: { maxAge: 60 * 60 * 24 * 30 },
  debug: process.env.NODE_ENV === 'development',
  pages: { signIn: '/auth/sign-in', error: '/', signOut: '/auth/logout' },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST, options };
