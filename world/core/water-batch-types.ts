export type WaterAllocation = Readonly<{ id: string; amountMl: number; capacityMl: number }>
export type WaterPortion = WaterAllocation & Readonly<{ pouredMl: number; cancelledMl: number }>
export type WaterBatch = Readonly<{
  initialMl: number
  volumeMl: number
  unallocatedMl: number
  discardedMl: number
  allocations: readonly WaterPortion[]
}>
export type WaterBatchCommand = Readonly<{ type: "pour" | "cancel"; id: string; amountMl: number }> | Readonly<{ type: "discard"; amountMl: number }>
