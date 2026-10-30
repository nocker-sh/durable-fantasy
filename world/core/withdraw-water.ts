import type { WaterStock, WaterWithdrawal } from "#/world/core/water-stock-types"

/** Household uses cannot draw on the vessel while it is away; discarded water remains an explicit outflow. */
export function withdrawWater(stock: WaterStock, command: WaterWithdrawal): WaterStock | Error {
  if (stock.phase !== "stored") return new Error("Household water is unavailable while its vessel is away")
  if (!Number.isSafeInteger(command.amountMl) || command.amountMl <= 0 || command.amountMl > stock.volumeMl) return new Error("Household water withdrawal exceeds the available stock")
  if (command.type === "discard") return { ...stock, volumeMl: stock.volumeMl - command.amountMl, discardedMl: stock.discardedMl + command.amountMl }
  if (command.purpose !== "drinking" && command.purpose !== "cooking") return new Error("Water use has no permitted household purpose")

  return { ...stock, volumeMl: stock.volumeMl - command.amountMl, usedMl: { ...stock.usedMl, [command.purpose]: stock.usedMl[command.purpose] + command.amountMl } }
}
