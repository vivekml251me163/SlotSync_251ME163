import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var dbPool: postgres.Sql | undefined;
}

const client = globalThis.dbPool ?? postgres(connectionString!, { 
  max: 10,
  prepare: false 
});

if (process.env.NODE_ENV !== "production") {
  globalThis.dbPool = client;
}

export const db = drizzle(client, { schema });
