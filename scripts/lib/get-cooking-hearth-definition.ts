import { getCookingTop } from "#/scripts/lib/get-cooking-top"
import { getCookingHearthParts } from "#/world/town/get-cooking-hearth-parts"
import { compileFlues } from "#/scripts/lib/flue-sections"
import { hearthDimensions } from "#/scripts/lib/hearth-dimensions"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Furniture = NonNullable<SettingDocument["furniture"]>[number]
type Props = { room: SettingDocument; building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; furniture: Furniture }

/** Resolve the real upper-floor shaft before deriving the plate and firebox in shared building coordinates. */
export function getCookingHearthDefinition(props: Props) {
  const room = props.room,
    furniture = props.furniture,
    top = getCookingTop(furniture.cooking_top)
  if (top instanceof Error) return top
  if (!room.grid || !Array.isArray(room.origin) || furniture.runtime_kind !== "hearth" || !furniture.hearth_front) return new Error("Cooking top has no placed hearth")
  const k = room.grid.cell_m,
    bounds = {
      x0: (room.origin[0] + furniture.rect[0]) * k,
      x1: (room.origin[0] + furniture.rect[0] + furniture.rect[2]) * k,
      z0: (room.origin[1] + furniture.rect[1]) * k,
      z1: (room.origin[1] + furniture.rect[1] + furniture.rect[3]) * k,
    }
  try {
    const shafts = compileFlues(props.building, props.documents).filter(
      (shaft) => shaft.lowerFloor === room.floor && shaft.x0 >= bounds.x0 && shaft.x1 <= bounds.x1 && shaft.z0 >= bounds.z0 && shaft.z1 <= bounds.z1,
    )
    if (shafts.length !== 1) return new Error("Cooking hearth has no unique supported smoke duct")
    const parts = getCookingHearthParts({ bounds, front: furniture.hearth_front, hearth: hearthDimensions(furniture.hearth), top, shaft: shafts[0], bottom: 0 })
    if (parts instanceof Error) return parts

    return { parts, bounds, top, shaft: shafts[0] }
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid cooking hearth placement")
  }
}
