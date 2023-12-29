import { relations } from 'drizzle-orm';
import { hashPassword } from '../../../lib/auth';
import { timestamp, pgTable, text, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { TypeOf, object, string } from 'zod';
import { authTokens, otpChangeFields } from '.';
export const accountType = pgEnum('account_type', ['student', 'teacher']);

export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  imageUrl: text('image_url'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  type: accountType('type'),
  hashedPassword: text('hashed_password'),
  passwordSalt: text('password_salt'),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'date',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;

export const userRelations = relations(users, ({ many }) => ({
  otpChangeFields: many(otpChangeFields),
  otpTokens: many(authTokens),
}));

export const clientCreateNewUserValidator = createInsertSchema(users, {
  firstName: (schema) => schema.firstName.max(64),
  lastName: (schema) => schema.lastName.max(64),
  email: (schema) => schema.email.email().toLowerCase(),
})
  .pick({
    firstName: true,
    lastName: true,
    image: true,
    email: true,
  })
  .and(
    object({
      password: string().min(8),
      confirmPassword: string().min(8),
    })
  );

export type ClientUserForm = TypeOf<typeof clientCreateNewUserValidator>;
export const createNewUserValidator = clientCreateNewUserValidator
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message:
      'Mismatch password ensure both password and confirmPassword are same',
  })
  .transform(async ({ password, confirmPassword: _, ...rest }) => ({
    ...(await hashPassword(password)),
    ...rest,
  }));
