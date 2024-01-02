import NextAuth, { NextAuthOptions } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/config/db/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import { users } from '@/config/db/schema';
import { eq, getTableColumns, ilike } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth';

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
        console.log({ credentials });
        if (!(credentials?.email && credentials.password)) {
          throw new Error(
            'Missing login credential email or password field missing'
          );
        }

        const [user] = await db
          .select()
          .from(users)
          .where(ilike(users.email, credentials!.email));

        if (!(user && verifyPassword(user, credentials.password))) {
          throw Error('User credential not a match. Check email or password');
        }

        //@ts-ignore
        delete user.hashedPassword;
        //@ts-ignore
        delete user.passwordSalt;

        return user ?? null;
      },
    }),
  ],

  session: { strategy: 'jwt' },
  jwt: { maxAge: 60 * 60 * 24 * 30 },
  debug: process.env.NODE_ENV === 'development',
  pages: { signIn: '/', signOut: '/sign-in' },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
