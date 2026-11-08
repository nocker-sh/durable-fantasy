import { migrateNatureRecord } from "#/world/server/migrate-nature-record"

export const natureMigrations = [{ version: 1, migrate: migrateNatureRecord }]
