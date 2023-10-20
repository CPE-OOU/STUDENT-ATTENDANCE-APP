import { studentAttendees, students, users } from '@/config/db/schema';
import { getTableColumns } from 'drizzle-orm';
import {
  jsonAggBuildObject,
  jsonBuildObject,
  resolveSortField,
} from '../utils';
import { InferSQLResolveType } from '@/types';

const { firstName, lastName, email } = getTableColumns(users);
const {
  id: studentId,
  department,
  level,
  university,
} = getTableColumns(students);

const studentAttendeeSelectFields = {
  studentId,
  firstName,
  lastName,
  email,
  department,
  level,
  university,
};

export const studentAttendeeBuildObject = jsonBuildObject(
  studentAttendeeSelectFields
);

export type StudentAttendeeBuildObject = InferSQLResolveType<
  typeof studentAttendeeBuildObject
>;

export const resolveLecturerViewAttendeeSort = (
  sort?: [string, 'asc' | 'desc']
) =>
  resolveSortField(
    studentAttendeeSelectFields,
    studentAttendees.createdAt,
    sort
  );
