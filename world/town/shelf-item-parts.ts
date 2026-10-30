import { storageBoxInterior } from "#/world/town/storage-box-interior"
import { quarterTurnRect } from "#/lib/engine/quarter-turn-rect"
import { shelfTurn } from "#/world/town/shelf-turn"
import type { ShelfSpec, ShelfPart, ShelfItem } from "#/world/town/shelf"
import { shelfBays } from "#/world/town/shelf-bays"

type Props = {
  x: number
  z: number
  width: number
  depth: number
  floor: number
  shelf: ShelfSpec
}

export function shelfItemParts(props: Props): ShelfPart[] {
  const bays = shelfBays(props.width, props.depth, props.shelf),
    sideways = props.shelf.front === "e" || props.shelf.front === "w",
    w = sideways ? props.depth : props.width,
    d = sideways ? props.width : props.depth
  const turn = shelfTurn(props.shelf.front),
    ids = new Set<string>(),
    placed: { item: ShelfItem; x0: number; z0: number; x1: number; z1: number }[] = []
  return (props.shelf.items ?? []).map((item) => {
    const bay = bays[item.board],
      x0 = item.across - item.width / 2,
      x1 = item.across + item.width / 2,
      z0 = -d / 2 + props.shelf.board + item.fromBack,
      z1 = z0 + item.depth
    if (
      !item.id ||
      ids.has(item.id) ||
      !["papers", "box", "linen", "tool"].includes(item.kind) ||
      !Number.isSafeInteger(item.board) ||
      !bay ||
      ![item.width, item.height, item.depth].every((n) => Number.isFinite(n) && n > 0) ||
      ![item.across, item.fromBack].every(Number.isFinite) ||
      item.fromBack < 0 ||
      x0 < -(w - 2 * props.shelf.board) / 2 ||
      x1 > (w - 2 * props.shelf.board) / 2 ||
      item.fromBack + item.depth > bay.depth ||
      item.height > bay.height
    )
      throw new Error("Shelf contents do not fit their bay")
    if (placed.some((other) => other.item.board === item.board && other.x0 < x1 && other.x1 > x0 && other.z0 < z1 && other.z1 > z0)) throw new Error("Shelf contents overlap")
    if (item.boxMaterial !== undefined && (item.kind !== "box" || !["wood", "iron"].includes(item.boxMaterial))) throw new Error("Invalid storage box material")
    if (item.lidHandle !== undefined && item.kind !== "box") throw new Error("Lid handle needs box contents")
    if (item.kind === "box") {
      storageBoxInterior(item)
      if (item.lidLift !== undefined && (!Number.isFinite(item.lidLift) || item.lidLift <= 0)) throw new Error("Invalid storage box lid lift")
    }
    if (
      item.kind === "tool" &&
      (!item.tool ||
        ![item.tool.handleWidth, item.tool.bladeLength].every((n) => Number.isFinite(n) && n > 0) ||
        item.tool.handleWidth > Math.min(item.width, item.depth) ||
        item.tool.bladeLength >= item.height)
    )
      throw new Error("Invalid stored tool dimensions")
    ids.add(item.id)
    placed.push({ item, x0, z0, x1, z1 })
    const y0 = props.floor + props.shelf.levels[item.board]
    return { part: "contents", ...quarterTurnRect({ bounds: { x0: x0, z0: z0, x1: x1, z1: z1 }, turn: turn, origin: [props.x, props.z] }), y0, y1: y0 + item.height }
  })
}
