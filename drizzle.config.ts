import { defineConfig } from "drizzle-kit";

function getDbUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URLL environment variable is not set");
  }
  return dbUrl;
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infrastructure/database/schema.ts",
  out: "./src/infrastructure/database/migrations",
  dbCredentials: {
    url: getDbUrl(),
  },
});
