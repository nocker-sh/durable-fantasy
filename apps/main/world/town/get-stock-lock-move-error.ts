import type { StockLockState } from "#/world/town/stock-lock-schemas"
import { getStockLockGateSides } from "#/world/town/get-stock-lock-gate-sides"
type Place = StockLockState["operator"]

/** Every individual crosses exactly one open gate; changing a location must not teleport across the whole lock. */
export function getStockLockMoveError(from: Place, to: Place, gates: Readonly<StockLockState["gates"]>): Error | null {
  if (from === to) return new Error("Stock lock move does not change location")
  const gatesHere: ReadonlyArray<keyof StockLockState["gates"]> = ["outer", "inner"]
  const connections = gatesHere.map((gate) => ({ places: Object.values(getStockLockGateSides(gate)), gate }))
  const connection = connections.find((connection) => connection.places.includes(from) && connection.places.includes(to))
  if (!connection || gates[connection.gate] !== "open") return new Error("Stock lock move has no open adjacent gate")

  return null
}
