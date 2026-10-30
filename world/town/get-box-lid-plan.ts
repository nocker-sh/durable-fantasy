import { storageLidPlan } from "#/world/town/storage-lid-plan"
import { certifyStorageLid } from "#/world/town/certify-storage-lid"
import { getStorageBoxPackingError } from "#/world/town/get-storage-box-packing-error"
import { getBoxLidSupportError } from "#/world/town/get-box-lid-support-error"
import { getStorageBoxContentBounds } from "#/world/town/get-storage-box-content-bounds"
import type { StorageLidPlan } from "#/world/town/storage-lid"
import type { StorageBoxBounds } from "#/world/town/storage-box-types"
import type { StorageBoxHandle } from "#/world/town/storage-box-types"
import type { StorageRoomSection } from "#/world/town/certify-storage-translation"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = {
  box: StorageBoxBounds
  wall: number
  lid: number
  lift: number
  rest: Point3
  contents: readonly LayoutBox[]
  section: StorageRoomSection
  support: Cuboid | null
  handle: StorageBoxHandle | null
}

/** Only the lid moves; its rest, packed contents and room obstacles use the same solid boards throughout the path. */
export function getBoxLidPlan(props: Props): StorageLidPlan | Error {
  if (props.box.y0 !== 0) return new Error("Storage box must use the room floor")
  const box = props.box,
    error =
      getStorageBoxPackingError({
        box: { width: box.x1 - box.x0, depth: box.z1 - box.z0, height: box.y1 - (props.handle?.height ?? 0), wall: props.wall, lid: props.lid },
        contents: props.contents,
        clearance: 0,
      }) ?? getBoxLidSupportError(props)
  if (error) return error
  try {
    const plan = storageLidPlan({ withdrawn: box, wall: props.wall, lid: props.lid, handle: props.handle ?? undefined, lift: props.lift, rest: props.rest })
    const contents = getStorageBoxContentBounds(props)
    const supports: Cuboid[] = []
    if (props.support !== null) supports.push(props.support)
    certifyStorageLid(plan, { ...props.section, obstacles: [...props.section.obstacles, ...contents, ...supports] })
    return plan
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid box lid plan")
  }
}
