import { applyWaterStockCommand } from "#/world/core/apply-water-stock-command"
import type { WaterStock } from "#/world/core/water-stock-types"
import type { WaterAllocation, WaterBatch } from "#/world/core/water-batch-types"
type Props = { stock: WaterStock; amountMl: number; allocations: readonly WaterAllocation[] }

/** Reserve one cooking batch once; allocations are future portions, not proof that water was heated or served. */
export function prepareWaterBatch(props: Props) {
  if (!Number.isSafeInteger(props.amountMl) || props.amountMl <= 0 || !props.allocations.length || new Set(props.allocations.map((portion) => portion.id)).size !== props.allocations.length)
    return new Error("Invalid water batch allocation")
  if (
    props.allocations.some(
      (portion) => !portion.id.trim() || !Number.isSafeInteger(portion.amountMl) || !Number.isSafeInteger(portion.capacityMl) || portion.amountMl <= 0 || portion.amountMl > portion.capacityMl,
    )
  )
    return new Error("Water allocation leaves its receiving vessel")
  const reservedMl = props.allocations.reduce((sum, portion) => sum + portion.amountMl, 0)
  if (!Number.isSafeInteger(reservedMl) || reservedMl > props.amountMl) return new Error("Water portions exceed their batch")
  const stock = applyWaterStockCommand(props.stock, { type: "use", purpose: "cooking", amountMl: props.amountMl })
  if (stock instanceof Error) return stock

  const batch: WaterBatch = {
    initialMl: props.amountMl,
    volumeMl: props.amountMl,
    allocations: props.allocations.map((portion) => ({ ...portion, pouredMl: 0, cancelledMl: 0 })),
    unallocatedMl: props.amountMl - reservedMl,
    discardedMl: 0,
  }

  return { stock, batch }
}
