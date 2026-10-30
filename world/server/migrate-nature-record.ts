import { restoreNature } from "#/world/server/restore-nature"
import type { NatureRecord } from "#/world/server/nature-record-types"

/** Validate the old node state before adding the durable delivery envelope. */
export function migrateNatureRecord(saved: unknown): NatureRecord {
  if (!saved || typeof saved !== "object" || !("nature" in saved)) throw new Error("Saved gathering record is unreadable")

  return { ...saved, nature: restoreNature(saved.nature), serial: 0, jobs: {} }
}
