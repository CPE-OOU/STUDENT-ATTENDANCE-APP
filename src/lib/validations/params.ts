import * as z from 'zod';

export const searchParamsSchema = z
  .object({
    page: z
      .string()
      .default('1')
      .transform((value) => Number(value) || 1),
    per_page: z
      .string()
      .default('10')
      .transform((value) => Number(value) || 10),
    sort: z
      .string()
      .optional()
      .transform(
        (value) =>
          [value?.split('.') ?? []].map(([field, order]) => [
            field,
            order?.toLowerCase() || 'desc',
          ])[0] as [string, 'asc' | 'desc'] | undefined
      ),
  })
  .transform((data) => ({ ...data, offset: Math.max(data.page - 1, 0) }));

export type PaginatableSearchParams = z.TypeOf<typeof searchParamsSchema>;

export const studentFilterSearchParams = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
});

export const verifyAccountSearchParams = z.object({
  mode: z.enum(['request']).optional(),
  type: z.enum(['account-verify', 'reset-password']).default('account-verify'),
});

export type VerifyAccountSearchParams = z.TypeOf<
  typeof verifyAccountSearchParams
>;
