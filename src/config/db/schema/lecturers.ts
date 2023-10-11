import { pgTable, uuid, integer } from 'drizzle-orm/pg-core';
import { users } from '.';
import { professionTitle, formOfAddress } from './enums';

export const lecturers = pgTable('lecturers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  title: professionTitle('title').notNull(),
  yearOfExperience: integer('year_of_experience'),
  formOfAddress: formOfAddress('form_of_address').notNull(),
});

export type Lecturer = typeof lecturers.$inferSelect;
