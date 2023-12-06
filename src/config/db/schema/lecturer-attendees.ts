import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { lecturers } from './lecturers';
import { courses } from './course';
import { relations } from 'drizzle-orm';

export const lecturerAttendees = pgTable(
  'lecturer_attendees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lecturerId: uuid('lecturer_id').references(() => lecturers.id),
    courseId: uuid('course_id').references(() => courses.id),
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
    }).defaultNow(),
  },
  ({ lecturerId, courseId }) => ({
    unq: unique('unique_lecturer').on(lecturerId, courseId),
  })
);

export const lecturerAttendeesRelation = relations(
  lecturerAttendees,
  ({ one }) => ({
    lecturer: one(lecturers, {
      fields: [lecturerAttendees.lecturerId],
      references: [lecturers.id],
    }),

    courseId: one(courses, {
      fields: [lecturerAttendees.courseId],
      references: [courses.id],
    }),
  })
);
