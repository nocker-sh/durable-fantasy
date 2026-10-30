import type { StockLockEvent } from "#/world/town/stock-lock-schemas"

/** Approach happens before unlatching; retreat follows the adjacent latch step so the caretaker does not operate a latch from the remote anchor. */
export function getStockLockEpisodeOrderError(events: readonly StockLockEvent[]): Error | null {
  for (const entry of events.entries()) {
    const event = entry[1],
      previous = events[entry[0] - 1],
      next = events[entry[0] + 1]
    if (event.kind === "operator_move") return new Error("Stock lock episode has an unreviewed operator crossing or gate motion")
    if (event.kind !== "gate") continue
    if ((event.action === "open" || event.action === "close") && !event.motion) return new Error("Stock lock episode has an unreviewed operator crossing or gate motion")
    if (event.action === "unlatch" && (next?.kind !== "gate" || next.gate !== event.gate || next.action !== "open")) return new Error("Stock gate unlatch must adjoin its opening episode")
    if (event.action === "open" && (previous?.kind !== "gate" || previous.gate !== event.gate || previous.action !== "unlatch")) return new Error("Stock gate opening has no adjacent unlatch step")
    if (event.action === "close" && (next?.kind !== "gate" || next.gate !== event.gate || next.action !== "latch")) return new Error("Stock gate closing must adjoin its latch step")
    if (event.action === "latch" && (previous?.kind !== "gate" || previous.gate !== event.gate || previous.action !== "close")) return new Error("Stock gate latch has no adjacent closing episode")
  }

  return null
}
