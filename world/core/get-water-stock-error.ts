import type { WaterStock } from "#/world/core/water-stock-types"

/** Millilitres keep the ledger exact; maintenance does not create clean water or erase an unrecorded remainder. */
export function getWaterStockError(stock: WaterStock): Error | null {
  const amounts = [stock.limitMl, stock.initialMl, stock.volumeMl, stock.receivedMl, stock.usedMl.drinking, stock.usedMl.cooking, stock.discardedMl]
  if (!amounts.every((amount) => Number.isSafeInteger(amount) && amount >= 0) || stock.limitMl <= 0 || stock.initialMl > stock.limitMl || stock.volumeMl > stock.limitMl)
    return new Error("Invalid water stock amount")
  if (stock.phase !== "stored" && stock.phase !== "at_source" && stock.phase !== "maintenance" && stock.phase !== "outbound" && stock.phase !== "inbound")
    return new Error("Invalid water vessel phase")
  if (stock.phase === "maintenance" && stock.volumeMl !== 0) return new Error("Water vessel maintenance requires an empty vessel")

  const input = stock.initialMl + stock.receivedMl,
    output = stock.volumeMl + stock.usedMl.drinking + stock.usedMl.cooking + stock.discardedMl
  if (!Number.isSafeInteger(input) || !Number.isSafeInteger(output) || input !== output) return new Error("Water stock does not conserve its recorded volume")

  return null
}
