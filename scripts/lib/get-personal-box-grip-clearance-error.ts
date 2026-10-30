import { getPersonalBoxFixedClearanceError } from "#/scripts/lib/get-personal-box-fixed-clearance-error"
import { getPersonalBoxNativeBridge } from "#/scripts/lib/get-personal-box-native-bridge"
import { getRoomStorageSection } from "#/scripts/lib/get-room-storage-section"
import { getStorageLidBridge } from "#/world/town/get-storage-lid-bridge"
import { getCertifiedBarBodyError } from "#/world/scene/figure/get-certified-bar-body-error"
import { getNativeFixedCuboidClearanceError } from "#/world/scene/figure/get-native-fixed-cuboid-clearance-error"
import { buildBody } from "#/world/scene/figure/body"
import { createBodyContext } from "#/world/scene/figure/context"
import { getForearmPairSelfClearanceError } from "#/world/scene/figure/get-forearm-pair-self-clearance-error"
import type { getPersonalBoxGripFrame } from "#/scripts/lib/get-personal-box-grip-frame"
type Props = Omit<Parameters<typeof getPersonalBoxGripFrame>[0], "state"> & { frame: Exclude<ReturnType<typeof getPersonalBoxGripFrame>, Error> }

/** Only the complete certified bridge has palm contact; the board, posts, fixed furniture and every other body part retain solid clearance. */
export function getPersonalBoxGripClearanceError(props: Props): Error | null {
  const fixed = getPersonalBoxFixedClearanceError(props),
    section = getRoomStorageSection(props.room, props.building, [])
  if (fixed) return fixed
  if (section instanceof Error) return section
  const frame = props.frame,
    body = buildBody(frame.look, frame.posed.skeleton, null),
    bodyScale = createBodyContext(frame.look, frame.posed.skeleton, null).S
  const bar = getPersonalBoxNativeBridge({ frame, parts: frame.parts })
  if (bar instanceof Error) return bar
  const contact = getCertifiedBarBodyError({ body, skeleton: frame.posed.skeleton, bodyScale, bar })
  if (contact) return contact
  const self = getForearmPairSelfClearanceError({ look: frame.look, skeleton: frame.posed.skeleton, margins: { l: 0, r: 0 } })
  if (self) return self
  const bridge = getStorageLidBridge(frame.parts)
  if (!bridge) return new Error("Personal box has no certified wooden bridge")
  const solids = frame.parts
    .filter((part) => part !== bridge && (part.part === "lid" || part.part === "lid-handle"))
    .map((part) => ({ x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 }))

  return getNativeFixedCuboidClearanceError({
    look: frame.look,
    skeleton: frame.posed.skeleton,
    body: frame.body,
    rootY: frame.posed.rootY,
    heading: Math.PI / 2,
    ceiling: section.ceiling,
    obstacles: solids,
  })
}
