import { object, string, z } from 'zod';

export const createAttendanceSchema = object({
  topicTitle: string().min(3).max(256),
  expiredAfter: z.enum(['15min', '30min', '1hr']),
});
