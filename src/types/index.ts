import { SQL } from 'drizzle-orm';

export type InferSQLResolveType<Query> = Query extends SQL<infer Payload>
  ? Payload
  : never;
