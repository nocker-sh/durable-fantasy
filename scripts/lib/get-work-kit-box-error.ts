import type { StorageBoxDimensions } from "#/world/town/storage-box-types"
import type { z } from "zod"
import type { workKitBoxSchema } from "#/scripts/lib/work-kit-box-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { getStorageBoxPackingError } from "#/world/town/get-storage-box-packing-error"

type Props = Readonly<{ box: z.infer<typeof workKitBoxSchema>; dimensions: StorageBoxDimensions; owner: string; documents: ReadonlyMap<string, SettingDocument> }>

/** Parcel envelopes must fit the closed cavity; this does not certify their contents, handling or the enclosing furniture. */
export function getWorkKitBoxError(props: Props): Error | null {
  const box = props.box
  if (box.contents.some((piece) => piece.owner !== props.owner || piece.makers.some((maker) => props.documents.get(maker)?.kind !== "residents")))
    return new Error("Work kit contents have invalid ownership or makers")

  return getStorageBoxPackingError({
    box: props.dimensions,
    contents: box.contents.map((piece) => ({ id: piece.id, origin: piece.origin_m, size: piece.size_m })),
    clearance: box.clearance_m,
  })
}
