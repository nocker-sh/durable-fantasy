import { storageBoxParts } from "#/world/town/storage-box-parts"
import { getStorageBoxPackingError } from "#/world/town/get-storage-box-packing-error"
import { getPersonalBoxLidHandle } from "#/scripts/lib/get-personal-box-lid-handle"
import type { personalStoragePackingSchema } from "#/scripts/lib/personal-storage-schema"
import type { z } from "zod"
type Props = { plan: z.infer<typeof personalStoragePackingSchema>; width: number; depth: number }

/** Height includes the raised handle; its wood never becomes extra room inside the chest. */
export function getPersonalStorageBoxError(props: Props): Error | null {
  const plan = props.plan,
    handle = getPersonalBoxLidHandle(plan.lid_handle)
  try {
    storageBoxParts({ bounds: { x0: 0, x1: props.width, y0: 0, y1: plan.height_m, z0: 0, z1: props.depth }, wall: plan.wall_m, lid: plan.lid_m, lift: 0, handle: handle ?? undefined })
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid personal storage box geometry")
  }

  return getStorageBoxPackingError({
    box: { width: props.width, depth: props.depth, height: plan.height_m - (handle?.height ?? 0), wall: plan.wall_m, lid: plan.lid_m },
    contents: plan.objects.map((piece) => ({ id: piece.id, origin: piece.position_m, size: piece.size_m })),
    clearance: plan.clearance_m,
  })
}
