import { relations } from 'drizzle-orm';
import { attendances } from './attendances';
import { boolean, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { studentAttendees } from '.';

export const studentAttendances = pgTable('student_attendances', {
  id: uuid('id').primaryKey().defaultRandom(),
  attendanceId: uuid('course_attendance')
    .references(() => attendances.id)
    .notNull(),
  studentAttendeeId: uuid('student_attendee_id')
    .references(() => studentAttendees.id)
    .notNull(),
  present: boolean('present').default(false),
  joinTime: timestamp('join_time', {
    mode: 'date',
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  }).defaultNow(),
});

export const studentAttendancesRelation = relations(
  studentAttendances,
  ({ one }) => ({
    attendance: one(attendances, {
      fields: [studentAttendances.attendanceId],
      references: [attendances.id],
    }),

    attendee: one(studentAttendees, {
      fields: [studentAttendances.studentAttendeeId],
      references: [studentAttendees.id],
    }),
  })
);
