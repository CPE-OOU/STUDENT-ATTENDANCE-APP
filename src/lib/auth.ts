import { db } from '../config/db/client';
import {
  AccountSetting,
  Lecturer,
  User,
  accountSettings,
  lecturers,
  users,
} from '../config/db/schema';
import { eq, getTableColumns } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcrypt';
import argon2 from 'argon2';
import { SALT_LENGTH } from './constant';
import { Student, students } from '../config/db/schema/student';

export const getSession = () => getServerSession();

export const getCurrentUser = async () => {
  const session = await getSession();
  if (!session?.user?.email) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      type: users.type,
      emailVerified: users.emailVerified,
      imageUrl: users.imageUrl,
      lecturer: getTableColumns(lecturers),
      student: getTableColumns(students),
      setting: getTableColumns(accountSettings),
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .leftJoin(students, eq(students.userId, users.id))
    .leftJoin(lecturers, eq(lecturers.userId, users.id))
    .fullJoin(accountSettings, eq(accountSettings.userId, users.id));

  return user as unknown as typeof users.$inferSelect & {
    setting: AccountSetting;
    student?: Student | null;
    lecturer?: Lecturer | null;
  };
};

export type ClientUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;

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
