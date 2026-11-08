import type { StorageBoxHandle } from "#/world/town/storage-box-types"
import type { ShelfSpec, ShelfItem } from "#/world/town/shelf"

/** The handle follows the stored box's across axis when a shelf faces east or west. */
export function shelfLidHandle(shelf: Pick<ShelfSpec, "front">, item: Pick<ShelfItem, "lidHandle">): StorageBoxHandle | undefined {
  return item.lidHandle ? { ...item.lidHandle, axis: shelf.front === "e" || shelf.front === "w" ? "z" : "x" } : undefined
}
