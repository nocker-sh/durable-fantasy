import { getShelfItem } from "#/scripts/lib/get-shelf-item"
import { shelfFrameSchema } from "#/scripts/lib/shelf-frame-schema"
import { shelfParts } from "#/world/town/shelf-parts"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import type { ShelfSpec, ShelfItem } from "#/world/town/shelf"

/** Preserve the throwing settings boundary while parsing each stored object without type assertions. */
export function shelfDimensions(value: unknown, width: number, depth: number): ShelfSpec {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Missing shelf dimensions")
  const parsed = shelfFrameSchema.safeParse(value)
  if (!parsed.success) throw new Error(parsed.error.issues.some((issue) => issue.path[0] === "contents") ? "Invalid shelf contents" : "Invalid shelf dimensions")
  const authored = parsed.data
  const items: ShelfItem[] = []
  for (const content of authored.contents ?? []) {
    const item = getShelfItem(content)
    if (item instanceof Error) throw item
    items.push(item)
  }
  const shelf: ShelfSpec = {
    height: authored.height_m,
    board: authored.board_thickness_m,
    levels: authored.board_tops_m,
    front: authored.front,
    items: authored.contents === undefined ? undefined : items,
  }

  shelfParts({ x: 0, z: 0, width: width, depth: depth, floor: 0, shelf: shelf })
  shelfItemParts({ x: 0, z: 0, width: width, depth: depth, floor: 0, shelf: shelf })

  return shelf
}
