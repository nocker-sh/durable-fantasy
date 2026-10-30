import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { dotVector3 as dot } from "../../../lib/engine/dot-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import { normalizeVector3 as norm } from "../../../lib/engine/normalize-vector3"
import type { Skel } from "#/world/scene/rig"
import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"
type Props = { skeleton: Skel; bar: Extract<WaterVesselPart, { kind: "capsule" }> }

/** The entire capsule lies in the actual native palm opening and strictly beyond the wrist/cuff plane. */
export function getWaterGripBarError(props: Props): Error | null {
  const hand = props.bar.side,
    grip = props.skeleton.handGrips?.[hand],
    wrist = props.skeleton.p[`hand_${hand}`],
    elbow = props.skeleton.p[`lowerarm_${hand}`]
  if (!grip || props.bar.section !== "grip" || grip.axis[0] !== 0 || grip.axis[1] !== 1 || grip.axis[2] !== 0 || grip.across[0] !== 1 || grip.across[1] !== 0 || grip.across[2] !== 0)
    return new Error("Water bar has no matching native grip opening")
  if (
    ![...props.bar.from, ...props.bar.to, props.bar.radius, grip.halfWidth, grip.halfDepth, ...wrist, ...elbow].every(Number.isFinite) ||
    props.bar.radius <= 0 ||
    grip.halfWidth <= 0 ||
    grip.halfDepth <= 0
  )
    return new Error("Invalid water grip certificate geometry")
  const centre = armGripPoint(elbow, wrist),
    direction = norm(sub(wrist, elbow)),
    bar = props.bar
  if (![...centre, ...direction].every(Number.isFinite) || Math.hypot(...direction) === 0) return new Error("Invalid water grip direction")
  if (
    Math.max(Math.abs(bar.from[0] - centre[0]), Math.abs(bar.to[0] - centre[0])) + bar.radius > grip.halfWidth ||
    Math.max(Math.abs(bar.from[2] - centre[2]), Math.abs(bar.to[2] - centre[2])) + bar.radius > grip.halfDepth
  )
    return new Error("Water handle leaves its palm opening")
  if (Math.min(dot(sub([...bar.from], wrist), direction), dot(sub([...bar.to], wrist), direction)) - bar.radius <= 0) return new Error("Water handle reaches behind the native cuff plane")

  return null
}
