import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '.';
import { relations } from 'drizzle-orm';
import { boolean } from 'drizzle-orm/pg-core';

export const accessGrantAction = pgEnum('auth_action', ['change-email']);

export type AccessGrantAction = (typeof accessGrantAction.enumValues)[number];

export const accessGrants = pgTable('access_grants', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  grantToken: text('grant_token').notNull().unique(),
  used: boolean('used').default(false),
  action: accessGrantAction('action').notNull(),
  expiresIn: timestamp('expires_in', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  }).defaultNow(),
});

export type AccessGrant = typeof accessGrants.$inferSelect;

export const accessGrantRelations = relations(accessGrants, ({ one }) => ({
  user: one(users, { fields: [accessGrants.userId], references: [users.id] }),
}));
