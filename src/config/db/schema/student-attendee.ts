import { boolean, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { studentAttendances, students } from '.';
import { courses } from './course';
import { relations } from 'drizzle-orm';

export const studentAttendees = pgTable(
  'student_attendees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('studentId').references(() => students.id),
    // removed: boolean('removed').default(false),
    courseId: uuid('course_id').references(() => courses.id),
    suspended: boolean('suspended').default(false),
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
    }).defaultNow(),
  },
  ({ studentId, courseId }) => ({
    uq: unique('unique_student').on(studentId, courseId),
  })
);

export const studentAttendeesRelation = relations(
  studentAttendees,
  ({ one, many }) => ({
    student: one(students, {
      fields: [studentAttendees.studentId],
      references: [students.id],
    }),

    studentAttendances: many(studentAttendances),
    courseId: one(courses, {
      fields: [studentAttendees.courseId],
      references: [courses.id],
    }),
  })
);
