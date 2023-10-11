import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { lecturers } from './lecturers';
import { relations } from 'drizzle-orm';
import { lecturerAttendees } from './lecturer-attendees';
import { attendances } from './attendances';
import { studentAttendees } from './student-attendee';

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 128 }).notNull(),
  courseCode: varchar('course_code', { length: 8 }),
  inviteCode: text('invite_code').unique(),
  inviteCodeDisabled: boolean('invite_code_disabled').default(false),
  creatorId: uuid('creatorId')
    .references(() => lecturers.id)
    .notNull(),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  }).defaultNow(),
});

export const courseRelations = relations(courses, ({ many, one }) => ({
  lecturerAttendees: many(lecturerAttendees),
  studentAttendees: many(studentAttendees),
  attendances: many(attendances),
  creator: one(lecturers, {
    fields: [courses.creatorId],
    references: [lecturers.id],
  }),
}));

export type Course = typeof courses.$inferSelect;
