import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("Error: DATABASE_URL environment variable is not defined.");
    process.exit(1);
  }

  console.log("Starting database migration runner...");
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log("Applying pending migrations from ./drizzle/migrations/ ...");
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("Database migrations applied successfully.");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration execution failed:", error);
    await sql.end();
    process.exit(1);
  }
}

runMigrations();
