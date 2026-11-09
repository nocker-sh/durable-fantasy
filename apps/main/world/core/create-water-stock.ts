import { getWaterStockError } from "#/world/core/get-water-stock-error"
import type { WaterStock } from "#/world/core/water-stock-types"

/** The operating fill limit, rather than the vessel's larger geometric capacity, bounds carried and stored water. */
export function createWaterStock(limitMl: number, initialMl: number): WaterStock | Error {
  const stock: WaterStock = { limitMl, initialMl, volumeMl: initialMl, receivedMl: 0, usedMl: { drinking: 0, cooking: 0 }, discardedMl: 0, phase: "stored" }
  const error = getWaterStockError(stock)

  return error ?? stock
}
