import type { StockLockState, StockLockEvent } from "#/world/town/stock-lock-schemas"
import { withStockLockGateCrossings } from "#/world/town/with-stock-lock-gate-crossings"
type Props = Readonly<{ state: Readonly<StockLockState>; event: Extract<StockLockEvent, { kind: "gate" }> }>
const before = { unlatch: "latched", open: "closed", close: "open", latch: "closed" },
  after = { unlatch: "closed", open: "open", close: "closed", latch: "latched" } satisfies Record<string, StockLockState["gates"]["outer"]>

/** A closed but unlatched peer gate is not a secure barrier; an empty-lock observation expires when the inner gate is unlatched. */
export function withStockLockGate(props: Props): StockLockState | Error {
  const state = props.state,
    event = props.event
  if ((event.gate === "inner" && state.operator === "outside") || (event.gate === "outer" && state.operator === "pasture")) return new Error("Operator is not adjacent to the stock gate")
  if (state.gates[event.gate] !== before[event.action]) return new Error("Invalid stock gate transition")
  if (event.action === "unlatch" || event.action === "open") {
    if ((event.gate === "outer" && state.gates.inner !== "latched") || (event.gate === "inner" && state.gates.outer !== "latched")) return new Error("Other stock gate must be latched")
    if (event.gate === "outer" && (!state.empty_checked || Object.values(state.stock).some((place) => place !== "pasture")))
      return new Error("Outer gate requires an inspected empty lock and retained stock")
  }
  const next = withStockLockGateCrossings(props)
  if (next instanceof Error) return next
  next.gates[event.gate] = after[event.action]
  if (event.gate === "inner" && event.action === "unlatch") next.empty_checked = false

  return next
}
