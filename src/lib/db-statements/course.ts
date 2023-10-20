import { courses, lecturers, users } from '@/config/db/schema';
import { asc, desc, getTableColumns, sql } from 'drizzle-orm';
import {
  jsonAggBuildObject,
  jsonBuildObject,
  resolveSortField,
} from '../utils';
import { InferSQLResolveType } from '@/types';

const { firstName, lastName } = getTableColumns(users);
const { id: lecturerId, formOfAddress, title } = getTableColumns(lecturers);
const { id, courseCode, name } = getTableColumns(courses);

const coureBuildObject = {
  id,
  courseName: name,
  courseCode,
  lecturerId,
  lecturerTitle: title,
  lectureFormOfAddress: formOfAddress,
  lecturerName: sql<string>`concat(${firstName}, ' ', ${lastName})`,
};

export const lectureBuildCourseObject = jsonBuildObject(coureBuildObject);
export type LectureBuildCoursePayload = InferSQLResolveType<
  typeof lectureBuildCourseObject
>;

export const resolveLectureViewCourseSort = (sort?: [string, 'asc' | 'desc']) =>
  resolveSortField(coureBuildObject, courses.createdAt, sort);

export function mapToDBSortField(field?: string) {
  if (field && field in coureBuildObject) {
    return coureBuildObject[field as keyof typeof coureBuildObject];
  }

  return courses.createdAt;
}

export function resolveLectureViewCourseField(sort?: [string, 'asc' | 'desc']) {
  const [field, orderType] = [mapToDBSortField(sort?.[0]), sort?.[1] ?? 'desc'];

  return orderType === 'desc' ? desc(field) : asc(field);
}
