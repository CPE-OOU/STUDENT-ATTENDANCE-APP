import { db } from '../config/db/client';
import { User, users } from '../config/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcrypt';
import argon2 from 'argon2';
import { SALT_LENGTH } from './constant';

export const getSession = () => getServerSession();

export const getCurrentUser = async () => {
  const session = await getSession();
  if (!session?.user?.email) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      type: users.type,
      emailVerified: users.emailVerified,
      image: users.image,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.email, session.user.email));

  return user;
};

export const hashPassword = async (
  plainPassword: string,
  saltLength = SALT_LENGTH
) => {
  const salt = await bcrypt.genSalt(saltLength);
  const hashedPassword = await argon2.hash(plainPassword, {
    salt: Buffer.from(salt),
    saltLength,
  });

  return {
    salt,
    hashedPassword,
    saltLength,
  };
};

export const verifyPassword = async (user: User, enteredPassword: string) => {
  if (!user.hashedPassword) {
    throw new TypeError('Missing hashedPassword on user');
  }

  return await argon2.verify(user.hashedPassword, enteredPassword, {
    salt: Buffer.from(user.passwordSalt!),
  });
};
