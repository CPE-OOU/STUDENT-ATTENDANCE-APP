import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { parsedEnv } from './src/config/env/validate';
dotenv.config();

export default {
  schema: './src/config/db/schema/index.ts',
  out: './src/config/db/migrations/',
  driver: 'pg',
  dbCredentials: {
    connectionString: parsedEnv.DATABASE_URL,
  },
} satisfies Config;
