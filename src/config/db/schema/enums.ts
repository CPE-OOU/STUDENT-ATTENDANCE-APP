import { pgEnum } from 'drizzle-orm/pg-core';

export const professionTitle = pgEnum('profession_title', [
  'teacher',
  'lecturer',
  'professor',
]);

export const formOfAddress = pgEnum('form_of_address', [
  'miss',
  'mr',
  'mrs',
  'sir',
  'doc',
  'prof',
]);
