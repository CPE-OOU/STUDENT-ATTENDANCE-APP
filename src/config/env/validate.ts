import { object, string, TypeOf } from 'zod';

const EnvDefinedSchema = object({
  DATABASE_URL: string().nonempty(),
});

const parsedEnv = EnvDefinedSchema.parse(process.env);
type ParsedEnv = TypeOf<typeof EnvDefinedSchema>;

export { parsedEnv, type ParsedEnv };
