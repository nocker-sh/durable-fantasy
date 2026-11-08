import { storageBoxInterior } from "#/world/town/storage-box-interior"
import { getStorageLidHandleParts } from "#/world/town/get-storage-lid-handle-parts"
import type { StorageBoxPart, StorageBoxPartsInput } from "#/world/town/storage-box-types"
/** Lift the loose lid and handle together while the bottom and walls stay fixed. */
export function storageBoxParts(props: StorageBoxPartsInput): StorageBoxPart[] {
  const bounds = props.bounds,
    wall = props.wall,
    lid = props.lid,
    lift = props.lift ?? 0,
    handle = props.handle
  const x0 = bounds.x0,
    y0 = bounds.y0,
    z0 = bounds.z0,
    x1 = bounds.x1,
    y1 = bounds.y1,
    z1 = bounds.z1,
    sideways = handle?.axis === "z"
  if (handle && handle.axis !== "x" && handle.axis !== "z") throw new Error("Invalid storage box handle axis")
  storageBoxInterior({ width: sideways ? z1 - z0 : x1 - x0, depth: sideways ? x1 - x0 : z1 - z0, height: y1 - y0, wall, lid, lidHandle: handle })
  if (![x0, y0, z0, x1, y1, z1, lift].every(Number.isFinite) || lift < 0) throw new Error("Invalid storage box position or lid lift")
  const bottom = y0 + wall,
    lidTop = y1 - (handle?.height ?? 0),
    top = lidTop - lid
  const parts: StorageBoxPart[] = [
    { part: "bottom", x0, y0, z0, x1, y1: bottom, z1 },
    { part: "side", x0, y0: bottom, z0, x1: x0 + wall, y1: top, z1 },
    { part: "side", x0: x1 - wall, y0: bottom, z0, x1, y1: top, z1 },
    { part: "side", x0: x0 + wall, y0: bottom, z0, x1: x1 - wall, y1: top, z1: z0 + wall },
    { part: "side", x0: x0 + wall, y0: bottom, z0: z1 - wall, x1: x1 - wall, y1: top, z1 },
    { part: "lid", x0, y0: top + lift, z0, x1, y1: lidTop + lift, z1 },
  ]
  if (handle) parts.push(...getStorageLidHandleParts({ bounds, handle, lidTop, lift }))
  return parts
}
