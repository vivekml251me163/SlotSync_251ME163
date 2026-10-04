import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

loadEnvConfig(process.cwd());

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const sql = postgres(connectionString);
  console.log("Adding COMPLETED to booking_status enum...");
  await sql`ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'COMPLETED'`;
  console.log("Done.");
  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
