import type { StorageBoxDimensions } from "#/world/town/storage-box-types"

/** A complete handle must fit on the lid and leave an opening between its supports. */
export function getStorageLidHandleError(box: StorageBoxDimensions): Error | null {
  const handle = box.lidHandle
  if (!handle) return null
  if (
    ![handle.span, handle.depth, handle.height, handle.thickness].every((value) => Number.isFinite(value) && value > 0) ||
    ![...(handle.offset ?? [0, 0])].every(Number.isFinite) ||
    Math.abs(handle.offset?.[0] ?? 0) + handle.span / 2 > box.width / 2 ||
    Math.abs(handle.offset?.[1] ?? 0) + handle.depth / 2 > box.depth / 2 ||
    2 * handle.thickness >= handle.span ||
    handle.thickness >= Math.min(handle.height, handle.depth)
  )
    return new Error("Invalid storage box lid handle")
  return null
}
