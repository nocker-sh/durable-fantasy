import type { personalStoragePackingSchema } from "#/scripts/lib/personal-storage-schema"
import type { StorageBoxHandle } from "#/world/town/storage-box-types"
import type { z } from "zod"
type Props = z.infer<typeof personalStoragePackingSchema>["lid_handle"]

/** The physical handle keeps its own span/depth axes, including its offset from the board centre. */
export function getPersonalBoxLidHandle(source: Props): StorageBoxHandle | null {
  if (!source) return null

  return { axis: source.axis, span: source.span_m, depth: source.depth_m, height: source.height_m, thickness: source.thickness_m, offset: source.offset_m }
}
