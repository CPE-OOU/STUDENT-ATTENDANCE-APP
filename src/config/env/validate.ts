import { object, string, TypeOf } from 'zod';

const EnvDefinedSchema = object({
  DATABASE_URL: string().url(),
  NOVU_API_KEY: string().min(1),
  NOVI_APP_HANDLER: string().min(1),
  NOVU_ENV_ID: string().min(1),
  NEXTAUTH_URL: string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: string().url(),
  NEXT_SUPABASE_ANON: string(),
  NEXT_PUBLIC_SUPABASE_SECRET_KEY: string(),
  NEXT_PUBLIC_URL: string().optional(),
  CAPTURE_VERIFICATION_SERVER: string().url(),
  CAPTURE_API_TOKEN_VERIFICATION_SERVER: string(),
});

const parsedEnv = EnvDefinedSchema.parse(process.env);
type ParsedEnv = TypeOf<typeof EnvDefinedSchema>;

export { parsedEnv, type ParsedEnv };
