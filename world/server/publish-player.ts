import type { PlayerState } from "#/world/core/player-types"
import type { PlayerRecord } from "#/world/server/player-record"

/** The body and its publication number are saved atomically by the enclosing player operation. */
export function publishPlayer(record: Pick<PlayerRecord, "player" | "deliveryRevision">, next: PlayerState, notify = true): PlayerState {
  // Normal callers restore the gameplay payload first. An explicit dev reset may replace an
  // unreadable payload, but must still continue its valid publication counter.
  const saved: unknown = record.player
  const previous = saved && typeof saved === "object" && "revision" in saved ? saved.revision : 0
  if (typeof previous !== "number" || !Number.isSafeInteger(previous) || previous < 0) throw new Error("Saved player revision is unreadable")
  const revision = previous + 1
  if (!Number.isSafeInteger(revision)) throw new Error("Player revisions exhausted")
  if (notify) {
    const deliveryRevision = record.deliveryRevision + 1
    if (!Number.isSafeInteger(deliveryRevision)) throw new Error("Delivery revisions exhausted")
    record.deliveryRevision = deliveryRevision
  }
  record.player = { ...next, revision }
  return record.player
}
