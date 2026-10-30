import { getWaterStockError } from "#/world/core/get-water-stock-error"
import { fillWaterVessel } from "#/world/core/fill-water-vessel"
import { withdrawWater } from "#/world/core/withdraw-water"
import { moveWaterVessel } from "#/world/core/move-water-vessel"
import type { WaterStock, WaterStockCommand } from "#/world/core/water-stock-types"

/** Pure household accounting shared by future server decisions and previews; no client may create a refill by returning home. */
export function applyWaterStockCommand(stock: WaterStock, command: WaterStockCommand): WaterStock | Error {
  const invalid = getWaterStockError(stock)
  if (invalid) return invalid
  if (command.type === "fill") {
    const filled = fillWaterVessel(stock, command.amountMl)
    if (filled instanceof Error) return filled
    return getWaterStockError(filled) ?? filled
  }
  if (command.type === "use" || command.type === "discard") {
    const withdrawn = withdrawWater(stock, command)
    if (withdrawn instanceof Error) return withdrawn
    return getWaterStockError(withdrawn) ?? withdrawn
  }

  return moveWaterVessel(stock, command)
}
