import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { parsedEnv } from '../env/validate';
import * as schema from './schema';

const client = postgres(parsedEnv.DATABASE_URL, { max: 1, ssl: true });

const db = drizzle(client, { schema });
export { db };
