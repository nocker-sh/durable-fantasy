import type { StorageBoxPart } from "#/world/town/storage-box-types"

/** A single U handle has two posts and one uniquely highest crossbar; missing or ambiguous wood is never invented. */
export function getStorageLidBridge(parts: readonly StorageBoxPart[]): StorageBoxPart | null {
  const handle = parts.filter((part) => part.part === "lid-handle")
  if (handle.length !== 3) return null
  const highest = handle.filter((part) => handle.every((other) => part.y1 >= other.y1))
  if (highest.length !== 1) return null

  return highest[0]
}
