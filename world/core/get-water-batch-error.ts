import type { WaterBatch } from "#/world/core/water-batch-types"

/** Reservations stay in the pot until poured; cancellation frees water but never removes it from the vessel. */
export function getWaterBatchError(batch: WaterBatch): Error | null {
  if (![batch.initialMl, batch.volumeMl, batch.unallocatedMl, batch.discardedMl].every((amount) => Number.isSafeInteger(amount) && amount >= 0) || batch.initialMl <= 0 || !batch.allocations.length)
    return new Error("Invalid water batch amount")
  const ids = new Set<string>()
  for (const portion of batch.allocations) {
    if (!portion.id.trim() || ids.has(portion.id)) return new Error("Duplicate or missing water portion")
    ids.add(portion.id)
    if (
      ![portion.amountMl, portion.capacityMl, portion.pouredMl, portion.cancelledMl].every((amount) => Number.isSafeInteger(amount) && amount >= 0) ||
      portion.amountMl <= 0 ||
      portion.amountMl > portion.capacityMl ||
      portion.pouredMl + portion.cancelledMl > portion.amountMl
    )
      return new Error("Invalid water portion balance")
  }
  const poured = batch.allocations.reduce((sum, portion) => sum + portion.pouredMl, 0),
    reserved = batch.allocations.reduce((sum, portion) => sum + (portion.amountMl - portion.pouredMl - portion.cancelledMl), 0)
  const assigned = batch.allocations.reduce((sum, portion) => sum + portion.amountMl, 0),
    held = batch.unallocatedMl + reserved,
    accounted = batch.volumeMl + poured + batch.discardedMl
  if (![assigned, held, accounted, poured, reserved].every(Number.isSafeInteger) || assigned > batch.initialMl || held !== batch.volumeMl || accounted !== batch.initialMl)
    return new Error("Water batch does not conserve its recorded volume")

  return null
}
