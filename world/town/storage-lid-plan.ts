import { storageBoxParts } from "#/world/town/storage-box-parts"
import type { StorageBoxBounds, StorageBoxHandle } from "#/world/town/storage-box-types"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
const EPS = 1e-9

type Props = {
  withdrawn: StorageBoxBounds
  wall: number
  lid: number
  handle: StorageBoxHandle | undefined
  lift: number
  rest: Point3
}

/** Lower the withdrawn box onto the room floor, then lift, translate and lower only its cover. */
export function storageLidPlan(props: Props) {
  if (!Number.isFinite(props.withdrawn.y0) || props.withdrawn.y0 < 0 || !Number.isFinite(props.lift) || props.lift <= 0 || !props.rest.every(Number.isFinite) || props.rest[1] < 0)
    throw new Error("Invalid storage lid placement")
  const original = storageBoxParts({ bounds: props.withdrawn, wall: props.wall, lid: props.lid, lift: 0, handle: props.handle }),
    floorBox = { ...props.withdrawn, y0: 0, y1: props.withdrawn.y1 - props.withdrawn.y0 },
    parts = storageBoxParts({ bounds: floorBox, wall: props.wall, lid: props.lid, lift: 0, handle: props.handle }),
    body = parts.filter((p) => p.part !== "lid" && p.part !== "lid-handle"),
    cover = parts.filter((p) => p.part === "lid" || p.part === "lid-handle"),
    plate = cover.find((p) => p.part === "lid")
  if (!plate) throw new Error("Storage box has no lid plate")
  const dx = props.rest[0] - (plate.x0 + plate.x1) / 2,
    dz = props.rest[2] - (plate.z0 + plate.z1) / 2
  if (plate.y0 + props.lift < props.rest[1] - EPS) throw new Error("Lid lift does not clear its rest support")
  const offsets: Point3[] = [
    [0, 0, 0],
    [0, props.lift, 0],
    [dx, props.lift, dz],
    [dx, props.rest[1] - plate.y0, dz],
  ]
  const lowering: Point3 = [0, -props.withdrawn.y0, 0]
  return { original, body, cover, lowering: lowering, offsets }
}
