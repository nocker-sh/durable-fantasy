import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { waterVesselPickupSchema } from "#/scripts/lib/water-vessel-support-schema"
import type { z } from "zod"
type Furniture = NonNullable<SettingDocument["furniture"]>[number]
type Props = { room: SettingDocument; furniture: Furniture; review: z.infer<typeof waterVesselPickupSchema> }

/** Shared operating floor stays exclusive while the vessel is being gripped and lifted. */
export function getWaterPickupOperationError(props: Props): Error | null {
  const k = props.room.grid?.cell_m,
    area = props.furniture.use_space?.[props.review.operation_space_index]?.rect,
    body = props.review.body_m
  if (!k || !area || body[0] < area[0] * k || body[0] >= (area[0] + area[2]) * k || body[1] < area[1] * k || body[1] >= (area[1] + area[3]) * k)
    return new Error("Water pickup body has no assigned operating place")
  const exclusive = props.review.exclusive_with
  if (new Set(exclusive).size !== exclusive.length || exclusive.some((symbol) => symbol === props.furniture.symbol || !props.room.furniture?.some((part) => part.symbol === symbol)))
    return new Error("Invalid water pickup exclusive operations")
  for (const other of props.room.furniture ?? []) {
    if (other.symbol === props.furniture.symbol) continue
    const shared = other.use_space?.some(
      (space) => area[0] < space.rect[0] + space.rect[2] && space.rect[0] < area[0] + area[2] && area[1] < space.rect[1] + space.rect[3] && space.rect[1] < area[1] + area[3],
    )
    if (shared && !exclusive.includes(other.symbol)) return new Error(`Water pickup shares operating floor with ${other.symbol}`)
  }

  return null
}
