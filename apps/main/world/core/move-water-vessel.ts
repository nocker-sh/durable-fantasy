import type { WaterStock, WaterVesselMovement } from "#/world/core/water-stock-types"

/** Custody changes availability only: leaving and returning never refill or discard water implicitly. */
export function moveWaterVessel(stock: WaterStock, command: WaterVesselMovement): WaterStock | Error {
  if (command.type === "leave_for_source" && stock.phase === "stored") return { ...stock, phase: "outbound" }
  if (command.type === "arrive_at_source" && stock.phase === "outbound") return { ...stock, phase: "at_source" }
  if (command.type === "leave_source" && stock.phase === "at_source") return { ...stock, phase: "inbound" }
  if (command.type === "return_home" && stock.phase === "inbound") return { ...stock, phase: "stored" }
  if (command.type === "begin_maintenance" && stock.phase === "stored" && stock.volumeMl === 0) return { ...stock, phase: "maintenance" }
  if (command.type === "end_maintenance" && stock.phase === "maintenance") return { ...stock, phase: "stored" }

  return new Error("Water vessel movement is unavailable in its current state")
}
