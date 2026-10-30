import { z } from "zod"
import { shelfFrameSchema } from "#/scripts/lib/shelf-frame-schema"
import { getShelfItem } from "#/scripts/lib/get-shelf-item"
import type { StorageBoxDimensions } from "#/world/town/storage-box-types"

type Props = Readonly<{ shelf: unknown; id: string; owner: string }>

/** Stored geometry is the sole source of box dimensions; work plans reference its identity. */
export function getStoredWorkKitDimensions(props: Props): StorageBoxDimensions | Error {
  const shelf = shelfFrameSchema.safeParse(props.shelf)
  if (!shelf.success) return new Error("Work kit has no dimensioned storage shelf")
  const matches = shelf.data.contents?.filter((value) => value !== null && typeof value === "object" && "id" in value && value.id === props.id) ?? []
  if (matches.length !== 1) return new Error("Work kit storage box reference is missing or ambiguous")
  const raw = matches[0]
  if (!z.object({ owner: z.literal(props.owner) }).safeParse(raw).success) return new Error("Work kit has no matching owned storage box")
  const item = getShelfItem(raw)
  if (item instanceof Error) return item
  if (item.kind !== "box") return new Error("Work kit storage item is not a box")

  return { width: item.width, height: item.height, depth: item.depth, wall: item.wall, lid: item.lid, lidHandle: item.lidHandle }
}
