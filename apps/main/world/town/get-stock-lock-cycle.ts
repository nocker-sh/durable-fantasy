import { stockLockEventSchema, stockLockStateSchema } from "#/world/town/stock-lock-schemas"
import { withStockLockEvent } from "#/world/town/with-stock-lock-event"

/** Review a complete caretaker visit with every named animal retained; this does not certify geometry, observation or real animal behaviour. */
export function getStockLockCycle(ids: readonly string[], events: unknown) {
  const parsed = stockLockEventSchema.array().min(1).safeParse(events)
  if (!parsed.success || ids.length === 0 || ids.some((id) => !id) || new Set(ids).size !== ids.length) return new Error("Invalid stock lock cycle")
  const initial = stockLockStateSchema.parse({ operator: "outside", stock: Object.fromEntries(ids.map((id) => [id, "pasture"])), gates: { outer: "latched", inner: "latched" }, empty_checked: false })
  const review = { state: initial, visited: false }
  for (const event of parsed.data) {
    const next = withStockLockEvent(review.state, event)
    if (next instanceof Error) return next
    review.state = next
    if (next.operator === "pasture") review.visited = true
  }
  const final = review.state
  if (!review.visited || final.operator !== "outside" || final.gates.outer !== "latched" || final.gates.inner !== "latched" || Object.values(final.stock).some((place) => place !== "pasture"))
    return new Error("Stock lock visit does not finish secured")

  return { initial, final, steps: parsed.data.length }
}
