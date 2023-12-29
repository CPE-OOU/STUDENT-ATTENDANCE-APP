import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { parsedEnv } from '../env/validate';
import * as schema from './schema';
import { resolvePathWithImportUrl } from '@/lib/utils';

const client = postgres(parsedEnv.DATABASE_URL, { max: 1, ssl: true });

const db = drizzle(client, { schema });
console.log(resolvePathWithImportUrl(import.meta.url, ['./migrations']));
try {
  await migrate(db, {
    migrationsFolder: resolvePathWithImportUrl(import.meta.url, [
      './migrations',
    ]),
  });
  console.log('migration completed');
  process.exit(0);
} catch (e) {
  console.log('Something went wrong while migrating');
  console.log((e as Error)?.message);
  process.exit(1);
}
