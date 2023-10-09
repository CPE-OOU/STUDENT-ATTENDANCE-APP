import {
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '.';

export const authAction = pgEnum('auth_action', [
  'account-verify',
  'reset-password',
]);

export const authTokens = pgTable(
  'auth_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    token: varchar('token', { length: 24 }).notNull(),
    action: authAction('action').notNull(),
    expiresIn: timestamp('expires_in', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
    }).defaultNow(),
  },
  ({ userId, action }) => ({
    singleUserAuth: unique('single_user_auth').on(userId, action),
  })
);

export type AuthToken = typeof authTokens.$inferSelect;
