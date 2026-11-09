import type { WildRecord } from "#/world/server/wild-record"

export function advanceWildRevision(record: WildRecord): number {
  const next = record.revision + 1
  if (!Number.isSafeInteger(next)) throw new Error("Wild revisions exhausted")
  record.revision = next
  return next
}
