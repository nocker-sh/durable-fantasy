import type { WaterStock } from "#/world/core/water-stock-types"

/** Filling is an explicit receipt at the source; the source's quality and handoff are separate requirements. */
export function fillWaterVessel(stock: WaterStock, amountMl: number): WaterStock | Error {
  if (stock.phase !== "at_source") return new Error("Water vessel must reach its source before filling")
  if (!Number.isSafeInteger(amountMl) || amountMl <= 0 || amountMl > stock.limitMl - stock.volumeMl) return new Error("Water receipt exceeds the operating fill limit")

  return { ...stock, volumeMl: stock.volumeMl + amountMl, receivedMl: stock.receivedMl + amountMl }
}
