import { viewWild } from "#/world/core/wild/view-wild"
import type { WildSnapshot } from "#/world/core/wild/types"
import type { WildRecord } from "#/world/server/wild-record"
import { advanceWildRevision } from "#/world/server/advance-wild-revision"

export function publishWild(record: WildRecord, map: string, now: number): WildSnapshot {
  return { revision: advanceWildRevision(record), monsters: viewWild(record.wild, map, now) }
}
