import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

loadEnvConfig(process.cwd());

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) { console.error("DATABASE_URL not set"); process.exit(1); }

  const sql = postgres(connectionString);

  console.log("Re-creating roles, role_permissions, and user_roles tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS "roles" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL UNIQUE,
      "description" text,
      "is_default" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "role_permissions" (
      "role_id" text NOT NULL,
      "permission_id" text NOT NULL,
      CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY ("role_id", "permission_id"),
      CONSTRAINT "role_permissions_role_id_roles_id_fk"
        FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE cascade,
      CONSTRAINT "role_permissions_permission_id_permissions_id_fk"
        FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE cascade
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "user_roles" (
      "user_id" text NOT NULL,
      "role_id" text NOT NULL,
      CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY ("user_id", "role_id"),
      CONSTRAINT "user_roles_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade,
      CONSTRAINT "user_roles_role_id_roles_id_fk"
        FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE cascade
    )
  `;

  console.log("Done. Tables created.");
  await sql.end();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
