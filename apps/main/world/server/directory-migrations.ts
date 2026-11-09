import { migrateDirectoryRecord } from "#/world/server/migrate-directory-record"

export const directoryMigrations = [{ version: 1, migrate: migrateDirectoryRecord }]
