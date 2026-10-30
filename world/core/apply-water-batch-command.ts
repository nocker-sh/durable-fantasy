import { getWaterBatchError } from "#/world/core/get-water-batch-error"
import type { WaterBatch, WaterBatchCommand } from "#/world/core/water-batch-types"

/** Record measured transfers separately from household withdrawal, heating and the receiving cup's later use. */
export function applyWaterBatchCommand(batch: WaterBatch, command: WaterBatchCommand): WaterBatch | Error {
  const invalid = getWaterBatchError(batch)
  if (invalid) return invalid
  if (!Number.isSafeInteger(command.amountMl) || command.amountMl <= 0) return new Error("Invalid water batch transfer amount")
  if (command.type === "discard") {
    if (command.amountMl > batch.unallocatedMl) return new Error("Reserved water must be cancelled before disposal")
    return {
      ...batch,
      volumeMl: batch.volumeMl - command.amountMl,
      unallocatedMl: batch.unallocatedMl - command.amountMl,
      discardedMl: batch.discardedMl + command.amountMl,
      allocations: batch.allocations.map((portion) => ({ ...portion })),
    }
  }
  if (command.type !== "pour" && command.type !== "cancel") return new Error("Unknown water batch transfer")
  const target = batch.allocations.find((portion) => portion.id === command.id)
  if (!target) return new Error("Water portion is unavailable")
  if (command.amountMl > target.amountMl - target.pouredMl - target.cancelledMl) return new Error("Water portion exceeds its remaining reservation")
  if (command.type === "cancel")
    return {
      ...batch,
      unallocatedMl: batch.unallocatedMl + command.amountMl,
      allocations: batch.allocations.map((portion) => ({ ...portion, cancelledMl: portion.cancelledMl + (portion.id === command.id ? command.amountMl : 0) })),
    }

  return {
    ...batch,
    volumeMl: batch.volumeMl - command.amountMl,
    allocations: batch.allocations.map((portion) => ({ ...portion, pouredMl: portion.pouredMl + (portion.id === command.id ? command.amountMl : 0) })),
  }
}
