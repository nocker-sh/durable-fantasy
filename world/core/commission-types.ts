import type { z } from "zod"
import type { ItemId } from "#/world/core/items/catalog"
import type { commissionOrderSchema } from "#/world/core/commission-order-schema"
export type Commission = {
  id: string
  craftsman: string
  output: { item: ItemId; count: number }
  inputs: readonly { item: ItemId; count: number }[]
  fee: number
  minutes: number
}
export type Order = z.infer<typeof commissionOrderSchema>
