import { lecturerAttendees } from './lecturer-attendees';
import { studentAttendees } from './student-attendee';
import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { studentAttendances } from './student-attendances';
import { courses } from '.';

export const attendances = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicTitle: varchar('topic_title', { length: 128 }).notNull(),
  courseId: uuid('course_id')
    .references(() => courses.id)
    .notNull(),
  lecturerAttendeeId: uuid('lecturer_attendee_id')
    .references(() => lecturerAttendees.id)
    .notNull(),
  attendanceCapturerId: uuid('attendance_capturer_id').references(
    () => studentAttendees.id
  ),

  expires: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),

  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  }).defaultNow(),
});

export const attendancesRelation = relations(attendances, ({ many, one }) => ({
  studentAttendances: many(studentAttendances),
  currentLecture: one(lecturerAttendees, {
    fields: [attendances.lecturerAttendeeId],
    references: [lecturerAttendees.id],
  }),

  attendanceCapture: one(studentAttendees, {
    fields: [attendances.attendanceCapturerId],
    references: [studentAttendees.id],
  }),

  course: one(courses, {
    fields: [attendances.courseId],
    references: [courses.id],
  }),
}));
