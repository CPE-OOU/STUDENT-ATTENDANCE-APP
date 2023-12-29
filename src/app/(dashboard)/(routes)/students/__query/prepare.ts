import { db } from '@/config/db/client';
import { attendances, courses, lecturerAttendees } from '@/config/db/schema';
import { sql } from 'drizzle-orm';

export const currentLecturerCoursesQuery = db
  .select()
  .from(courses)
  .where(
    sql`
${courses.id} = (
  SELECT ${attendances.courseId} FROM ${lecturerAttendees}
  INNER JOIN ${courses} ON ${courses.id} = ${lecturerAttendees.courseId}
  INNER JOIN ${attendances} ON ${attendances.lecturerAttendeeId} = ${courses.id}
  WHERE ${lecturerAttendees.lecturerId} = ${sql.placeholder('lecturerId')}
  ORDER BY ${attendances.createdAt} DESC
  LIMIT ${sql.placeholder('limit')}::BIGINT
)
`
  )
  .prepare('currentLectureCoursesQuery');

export type CurrentLecturerCoursesQueryPlaceholders = {
  lecturerId: string;
  limit: null | number;
};
