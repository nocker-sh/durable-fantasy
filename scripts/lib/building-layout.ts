import type { z } from "zod"
import type { buildingLayoutSchema } from "#/scripts/lib/building-layout-schema"

export type Connection = {
  kind?: string
  door?: number[]
  target: string
  target_door?: number[]
  width_cells?: number
  furniture?: string
  target_furniture?: string
  access?: number[]
  target_access?: number[]
}

export type Layout = z.infer<typeof buildingLayoutSchema>
