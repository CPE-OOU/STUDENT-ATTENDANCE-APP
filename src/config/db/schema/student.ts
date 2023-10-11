import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from '.';

export const gradeLevel = pgEnum('grade_level', [
  '100',
  '200',
  '300',
  '400',
  '500',
  '700',
]);

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  university: varchar('university', { length: 128 }).notNull(),
  department: varchar('department', { length: 128 }).notNull(),
  level: gradeLevel('level').notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  }).defaultNow(),
});

export type Student = typeof students.$inferSelect;
