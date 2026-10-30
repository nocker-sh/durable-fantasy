import { getStorageLidBridge } from "#/world/town/get-storage-lid-bridge"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import type { getPersonalBoxReachFrame } from "#/scripts/lib/get-personal-box-reach-frame"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
type Props = { frame: Exclude<ReturnType<typeof getPersonalBoxReachFrame>, Error>; parts: readonly StorageBoxPart[] }

/** The capsule encloses the whole rectangular wooden crossbar, including all corners, in the same grounded native frame. */
export function getPersonalBoxNativeBridge(props: Props): RoundGripBar | Error {
  const bridge = getStorageLidBridge(props.parts),
    frame = props.frame
  if (!bridge) return new Error("Personal box has no unique wooden bridge")
  const box = toHeadingLocalCuboid({
    box: { x0: bridge.x0, x1: bridge.x1, bottom: bridge.y0, top: bridge.y1, z0: bridge.z0, z1: bridge.z1 },
    root: [frame.body[0], frame.posed.rootY, frame.body[1]],
    heading: Math.PI / 2,
  })
  if (box instanceof Error) return box
  if (box.x1 - box.x0 <= Math.max(box.top - box.bottom, box.z1 - box.z0)) return new Error("Personal box bridge has no matching native axis")
  const y = (box.bottom + box.top) / 2,
    z = (box.z0 + box.z1) / 2

  return { from: [box.x0, y, z], to: [box.x1, y, z], radius: Math.hypot((box.top - box.bottom) / 2, (box.z1 - box.z0) / 2) }
}
