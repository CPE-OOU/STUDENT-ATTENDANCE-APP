import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { users } from '.';
import { relations } from 'drizzle-orm';

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipcode: text('zipcode'),
  country: text('country'),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  }).defaultNow(),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));
