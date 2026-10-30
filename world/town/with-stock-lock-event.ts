import { getStockLockMoveError } from "#/world/town/get-stock-lock-move-error"
import { withStockLockGate } from "#/world/town/with-stock-lock-gate"
import type { StockLockState, StockLockEvent } from "#/world/town/stock-lock-schemas"

/** Record movements of individual animals separately from the caretaker; inspection never erases an animal left in the lock. */
export function withStockLockEvent(state: Readonly<StockLockState>, event: StockLockEvent): StockLockState | Error {
  if (event.kind === "gate") return withStockLockGate({ state, event })
  const next = { ...structuredClone(state) }
  if (event.kind === "inspect_empty") {
    if (state.operator === "pasture" || state.gates.inner !== "latched" || Object.values(state.stock).some((place) => place !== "pasture")) return new Error("Cannot confirm an empty stock lock")
    next.empty_checked = true
    return next
  }
  if (event.kind === "stock_move") {
    if (!Object.hasOwn(state.stock, event.id)) return new Error("Unknown stock lock animal")
    const error = getStockLockMoveError(state.stock[event.id], event.to, state.gates)
    if (error) return error
    next.stock[event.id] = event.to
    next.empty_checked = false
    return next
  }
  const error = getStockLockMoveError(state.operator, event.to, state.gates)
  if (error) return error
  next.operator = event.to

  return next
}
