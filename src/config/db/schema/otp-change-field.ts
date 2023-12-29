import { json, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { authTokens, users } from '.';
import { relations } from 'drizzle-orm';
import { accessGrantAction, accessGrants } from './access-grant';

export const otpChangeType = pgEnum('otp_change_type', [
  ...accessGrantAction.enumValues,
]);

export type OtpChangeType = (typeof otpChangeType.enumValues)[number];

export const otpChangeFields = pgTable('otp_change_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  tokenId: uuid('id')
    .references(() => authTokens.id)
    .notNull(),
  value: json('value').notNull(),
  grantId: uuid('grant_id').references(() => accessGrants.id),
  type: otpChangeType('type').notNull(),
  expiresIn: timestamp('expires_in', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  }).defaultNow(),
});

export type OtpChangeField = typeof authTokens.$inferSelect;

export const otpChangeFieldsRelations = relations(
  otpChangeFields,
  ({ one }) => ({
    user: one(users, {
      fields: [otpChangeFields.userId],
      references: [users.id],
    }),
    token: one(authTokens, {
      fields: [otpChangeFields.tokenId],
      references: [authTokens.id],
    }),
  })
);
