// import { db } from '@/config/db/client';
// import {
//   courses,
//   lecturerAttendees,
//   lecturers,
//   studentAttendees,
//   students,
//   users,
// } from '@/config/db/schema';
// import { getCurrentUser } from '@/lib/auth';
// import { createFailResponse, createSuccessResponse } from '@/lib/response';
// import {
//   createInvalidPayloadResponse,
//   getUrlQuery,
//   jsonAggBuildObject,
// } from '@/lib/utils';
// import { asc, eq, getTableColumns, sql } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
// import { StatusCodes } from 'http-status-codes';
// import { ZodError, number, object, string } from 'zod';

// const querySchema = object({
//   limit: number({ coerce: true }).default(30),
//   page: number({ coerce: true }).default(1),
// });

// const paramSchema = object({
//   courseId: string().uuid(),
// });

// export const DELETE = async (req: Request, params: unknown) => {
//   try {
//     const user = await getCurrentUser();
//     if (!user) {
//       return createFailResponse(
//         {
//           title: 'Unauthorized',
//           message: 'User not authenicated. Kindly perform a sign in again',
//         },
//         StatusCodes.UNAUTHORIZED
//       );
//     }

//     if (user.type !== 'teacher') {
//       return createFailResponse(
//         {
//           title: 'Unauthorized',
//           message: 'Resource only allowed for teachers',
//         },
//         StatusCodes.UNAUTHORIZED
//       );
//     }
//     const { courseId } = paramSchema.parse(params);

//     db.execute(sql`
//     SELECT ()
//     `)

//     return createSuccessResponse(
//       {
//         title: 'Get class attendees',
//         message: 'list of class attendees',
//         data: classAttendees,
//       },
//       StatusCodes.OK
//     );
//   } catch (e) {
//     console.log('[GET CLASS ATTENDEE]', e);
//     if (Object(e) === e) {
//       if (e instanceof ZodError) return createInvalidPayloadResponse(e);
//     }

//     return createFailResponse(
//       { title: 'Internal Server Error', message: (e as any)?.message },
//       StatusCodes.INTERNAL_SERVER_ERROR
//     );
//   }
// };
