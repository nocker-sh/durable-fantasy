import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { storageBoxInterior } from "#/world/town/storage-box-interior"
import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import type { hotWaterServiceSchema } from "#/scripts/lib/hot-water-service-schema"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = { room: SettingDocument; plan: z.infer<typeof hotWaterServiceSchema>; profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error> }

/** Store the complete cold, dry, empty and closed object including its fixed carrying bridge. */
export function getPotStorageError(props: Props): Error | null {
  const cabinet = props.room.furniture?.find((furniture) => furniture.symbol === props.plan.storage.shelf)
  if (!cabinet || !props.room.grid) return new Error("Pouring pot has no storage cabinet")
  try {
    const k = props.room.grid.cell_m,
      shelf = shelfDimensions(cabinet.shelf, cabinet.rect[2] * k, cabinet.rect[3] * k),
      box = shelf.items?.find((item) => item.id === props.plan.storage.box)
    if (box?.kind !== "box") return new Error("Pouring pot has no covered storage box")
    const interior = storageBoxInterior(box),
      p = props.profile

    return getBoxLayoutError({
      size: [interior.width, interior.height, interior.depth],
      boxes: [{ id: props.plan.id, origin: props.plan.storage.position_m, size: [p.width, p.height, p.depth] }],
      gap: 0,
    })
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid pouring pot storage")
  }
}
