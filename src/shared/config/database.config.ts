import { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();
function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

type DatabaseConfig = {
  dbURL: string;
  migrationConfig: MigrationConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "src/infrastructure/database/migrations",
};

export const databaseConfig: DatabaseConfig = {
  dbURL: envOrThrow("DATABASE_URL"),
  migrationConfig,
};
