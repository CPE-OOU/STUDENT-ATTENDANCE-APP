import {
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '.';
import { accessGrantAction } from './access-grant';

export const authAction = pgEnum('auth_action', [
  'account-verify',
  'reset-password',
  ...accessGrantAction.enumValues,
]);

export type AuthAction = (typeof authAction.enumValues)[number];

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
    userIp: varchar('user_ip', { length: 16 }),
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
