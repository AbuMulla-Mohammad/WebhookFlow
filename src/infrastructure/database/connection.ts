import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseConfig } from "../../shared/config/database.config.js";
import * as schema from "./schema.js";

const client = postgres(databaseConfig.dbURL);

export const db = drizzle(client, { schema });

export async function closeDatabase(): Promise<void> {
  await client.end();
}
