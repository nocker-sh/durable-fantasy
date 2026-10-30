import { withStockLockGateMotion } from "#/world/town/with-stock-lock-gate-motion"
import { getStockLockMoveError } from "#/world/town/get-stock-lock-move-error"
import type { StockLockState, StockLockEvent } from "#/world/town/stock-lock-schemas"
type Props = Readonly<{ state: Readonly<StockLockState>; event: Extract<StockLockEvent, { kind: "gate" }> }>

/** Preserve individual observations made while the active gate rotates, including a sheep left in the lock after it closes. */
export function withStockLockGateCrossings(props: Props): StockLockState | Error {
  const event = props.event,
    crossings = event.stock_crossings ?? []
  if ((event.motion || crossings.length > 0) && event.action !== "open" && event.action !== "close") return new Error("A stationary latch action cannot cross the stock gate")
  const next = withStockLockGateMotion(props)
  if (next instanceof Error) return next
  if (new Set(crossings.map((crossing) => crossing.id)).size !== crossings.length) return new Error("Duplicate animal crossing in stock gate motion")
  const gates = { ...props.state.gates }
  gates[event.gate] = "open"
  for (const crossing of crossings) {
    if (!Object.hasOwn(next.stock, crossing.id)) return new Error("Unknown stock lock animal")
    const error = getStockLockMoveError(next.stock[crossing.id], crossing.to, gates)
    if (error) return error
    next.stock[crossing.id] = crossing.to
    next.empty_checked = false
  }

  return next
}
