import { authoredFurnitureSourceSchema } from "#/scripts/lib/authored-renderer-source-schema"
import { getCookingTop } from "#/scripts/lib/get-cooking-top"
import { hearthDimensions } from "#/scripts/lib/hearth-dimensions"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { bedDimensions } from "#/scripts/lib/bed-dimensions"
import { workSurface } from "#/scripts/lib/work-surface"
import { seatDimensions } from "#/scripts/lib/seat-dimensions"
import { parseFurnitureKind } from "#/world/town/parse-furniture-kind"
import type { AuthoredRoom } from "#/world/town/floorplan/authored-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"

type Props = Readonly<{ furniture: NonNullable<SettingDocument["furniture"]>[number]; roomId: string; cellM: number }>

/** A renderer is selected explicitly; supplemental physical metadata uses the existing shared parsers. */
export function compileAuthoredFurniture(props: Props): AuthoredRoom["furniture"][number] {
  const furniture = props.furniture,
    parsed = authoredFurnitureSourceSchema.safeParse(furniture)
  if (!parsed.success) throw new Error(`Missing explicit renderer: ${props.roomId}/${furniture.symbol}`)
  const source = parsed.data,
    width = source.rect[2] * props.cellM,
    depth = source.rect[3] * props.cellM
  const seat = source.runtime_kind === "chair" ? seatDimensions(furniture.seat, width, depth) : undefined
  const cookingTop = furniture.cooking_top === undefined ? undefined : getCookingTop(furniture.cooking_top)
  if (cookingTop instanceof Error) throw cookingTop
  return {
    cookingTop,
    hearth: source.runtime_kind === "hearth" ? hearthDimensions(furniture.hearth) : undefined,
    hearthFront: furniture.hearth_front,
    shelf: source.runtime_kind === "shelf" ? shelfDimensions(furniture.shelf, width, depth) : undefined,
    bed: source.runtime_kind === "bed" ? bedDimensions(furniture.bed, width, depth) : undefined,
    workSurface: source.runtime_kind === "table" ? workSurface(furniture.work_surface, width, depth) : undefined,
    seat,
    wallMount: furniture.wall_mount ? { side: furniture.wall_mount.side, bottom: furniture.wall_mount.bottom_m, height: furniture.wall_mount.height_m } : undefined,
    symbol: source.symbol,
    name: source.name,
    kind: parseFurnitureKind(source.runtime_kind),
    solid: source.runtime_solid,
    rect: source.rect,
  }
}
