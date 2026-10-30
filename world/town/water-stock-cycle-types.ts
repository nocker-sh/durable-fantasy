import type { z } from "zod"
import type { waterStockCycleSchema } from "#/world/town/water-stock-cycle-schema"

export type WaterStockEvent = z.infer<typeof waterStockCycleSchema>["events"][number]
export type WaterStockPosition = Readonly<{ value: number; minimum: number; maximum: number; received: number; used: number; minute: number }>
