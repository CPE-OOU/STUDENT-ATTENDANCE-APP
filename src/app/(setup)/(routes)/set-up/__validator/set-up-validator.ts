import { formOfAddress, professionTitle } from '@/config/db/schema/enums';
import { TypeOf, object, enum as enum_, string, union, number } from 'zod';

export const setupChooseAccountTypeSchema = object({
  type: enum_(['student', 'teacher']),
});

export type SetupChooseAccountTypeFormData = TypeOf<
  typeof setupChooseAccountTypeSchema
>;
export const studentProfileFormSchema = object({
  university: string().min(1),
  department: string().min(2),
  level: enum_(['100', '200', '300', '400', '500', '700']),
});

export type StudentSetupProfileFormData = TypeOf<
  typeof studentProfileFormSchema
>;

export const lecturerProfileFormSchema = object({
  title: enum_(professionTitle.enumValues),
  yearOfExperience: number({ coerce: true }).optional(),
  formOfAddress: enum_(formOfAddress.enumValues),
});

export type LecturerProfileFormData = TypeOf<typeof lecturerProfileFormSchema>;
export const optionalProfileImageSchema = object({
  url: string().url(),
});

export type OptionalProfileImageFormData = TypeOf<
  typeof optionalProfileImageSchema
>;

export const setupProfileInfoFormSchema = studentProfileFormSchema.and(
  optionalProfileImageSchema.transform(({ url }) => ({ profileImage: url }))
);

export type SetupProfileInfoFormSchema = TypeOf<
  typeof setupProfileInfoFormSchema
>;

type InferTypeFromUnion<T, Delimiter> = T extends T
  ? T extends Delimiter
    ? T
    : never
  : never;

export const userAsLecturerFormSchema = object({
  type: enum_(['teacher']),
  profileInfo: lecturerProfileFormSchema.and(
    union([
      optionalProfileImageSchema.transform(({ url }) => ({
        profileImage: url,
      })),
      object({ profileImage: string().url().nullable().optional() }),
    ])
  ),
});

export const userAsStudentFormSchema = object({
  type: enum_(['student']),
  profileInfo: studentProfileFormSchema.and(
    union([
      optionalProfileImageSchema.transform(({ url }) => ({
        profileImage: url,
      })),
      object({ profileImage: string().url().nullable().optional() }),
    ])
  ),
});

export type UserAsLecturerFormData = TypeOf<typeof userAsLecturerFormSchema>;
export type UserAsStudentFormData = TypeOf<typeof userAsStudentFormSchema>;
