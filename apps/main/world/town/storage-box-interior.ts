import { getStorageLidHandleError } from "#/world/town/get-storage-lid-handle-error"
import type { StorageBoxDimensions } from "#/world/town/storage-box-types"

/** Retain the caller's units and reserve the handle height above the loose lid. */
export function storageBoxInterior(box: StorageBoxDimensions) {
  const handleError = getStorageLidHandleError(box)
  if (handleError) throw handleError
  const wall = box.wall,
    lid = box.lid,
    bodyHeight = box.height - (box.lidHandle?.height ?? 0)
  if (
    ![box.width, box.depth, box.height].every((value) => Number.isFinite(value) && value > 0) ||
    typeof wall !== "number" ||
    typeof lid !== "number" ||
    ![wall, lid].every((value) => Number.isFinite(value) && value > 0) ||
    box.width <= 2 * wall ||
    box.depth <= 2 * wall ||
    bodyHeight <= wall + lid
  )
    throw new Error("Invalid storage box wall or lid")
  const width = box.width - 2 * wall,
    depth = box.depth - 2 * wall,
    height = bodyHeight - wall - lid
  return { width, depth, height, volume: width * depth * height }
}
