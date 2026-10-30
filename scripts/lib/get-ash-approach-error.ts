import { getStoragePathError } from "#/world/town/get-storage-path-error"
import { certifyStorageCarry, type StorageCarryPose } from "#/world/town/storage-carry"
import { getUprightStorageOffsets } from "#/world/town/get-upright-storage-offsets"
import type { StorageRoomSection } from "#/world/town/certify-storage-translation"
import { MIN_STANDING_HEADROOM_M } from "#/scripts/lib/spatial-rules"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
import type { AshReceiving } from "#/scripts/lib/ash-receiving-schema"
type Props = { parts: ReadonlyArray<StorageBoxPart>; bodyStart: readonly [number, number]; receiving: AshReceiving; radius: number; height: number; section: StorageRoomSection }
/** Only the empty upright approach to staging is certified; placing it beside the worker remains a separate transition. */
export function getAshApproachError(props: Props): Error | null {
  const offsets = getUprightStorageOffsets({ bodyStart: props.bodyStart, poses: props.receiving.approach.poses, height: props.height })
  if (offsets instanceof Error) return offsets
  const bottom = props.parts.find((part) => part.part === "bottom")
  if (!bottom) return new Error("Ash approach has no box bottom")

  const poses: StorageCarryPose[] = props.receiving.approach.poses.map((body_m) => ({ body_m, turn: 0 }))
  const top = Math.max(MIN_STANDING_HEADROOM_M, ...props.parts.map((part) => part.y1 + props.height))
  const obstacles = props.section.obstacles
    .filter((obstacle) => obstacle.bottom < top - 1e-9 && obstacle.top > 1e-9)
    .map((obstacle): readonly [number, number, number, number] => [obstacle.x0, obstacle.z0, obstacle.x1, obstacle.z1])
  try {
    certifyStorageCarry({
      relative: [bottom.x0 - props.bodyStart[0], bottom.z0 - props.bodyStart[1], bottom.x1 - props.bodyStart[0], bottom.z1 - props.bodyStart[1]],
      radius: props.radius,
      poses: poses,
      width: props.section.bounds.x1,
      depth: props.section.bounds.z1,
      obstacles: obstacles,
      name: "empty ash receiver",
    })
    return getStoragePathError({ parts: props.parts, offsets, section: props.section, name: "Empty ash receiver" })
  } catch (error) {
    if (error instanceof Error) return error
    throw error
  }
}
