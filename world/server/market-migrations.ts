import { migrateMarketRecord } from "#/world/server/migrate-market-record"

export const marketMigrations = [{ version: 1, migrate: migrateMarketRecord }]
