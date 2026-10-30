import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { crossVector3 as cross } from "../../../lib/engine/cross-vector3"
import { dotVector3 as dot } from "../../../lib/engine/dot-vector3"
import { normalizeVector3 as norm } from "../../../lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import type { Skel } from "#/world/scene/rig"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
type Props = { skeleton: Skel; hand: "l" | "r"; bar: RoundGripBar }

/** Every point of the capsule must stay in the palm opening and strictly in front of the unmodified wrist/cuff plane. */
export function getRoundBarContactError(props: Props): Error | null {
  const grip = props.skeleton.handGrips?.[props.hand],
    bar = props.bar,
    wrist = props.skeleton.p[`hand_${props.hand}`],
    elbow = props.skeleton.p[`lowerarm_${props.hand}`]
  if (
    !grip ||
    ![...bar.from, ...bar.to, bar.radius, ...grip.axis, ...grip.across, grip.halfWidth, grip.halfDepth, ...wrist, ...elbow].every(Number.isFinite) ||
    bar.radius <= 0 ||
    grip.halfWidth <= 0 ||
    grip.halfDepth <= 0
  )
    return new Error("Round bar has no valid palm contact profile")
  const axis = norm(sub([...bar.to], [...bar.from])),
    direction = norm(sub(wrist, elbow)),
    centre = armGripPoint(elbow, wrist),
    normal = cross(grip.across, grip.axis)
  if (
    ![...axis, ...direction, ...centre, ...normal].every(Number.isFinite) ||
    Math.abs(Math.hypot(...grip.axis) - 1) > 1e-9 ||
    Math.abs(Math.hypot(...grip.across) - 1) > 1e-9 ||
    Math.abs(dot(grip.axis, grip.across)) > 1e-9 ||
    Math.abs(dot(grip.axis, axis)) < 1 - 1e-9 ||
    Math.hypot(...direction) < 0.99
  )
    return new Error("Round bar and palm opening axes disagree")
  for (const edge of [bar.from, bar.to]) {
    const relative = sub([...edge], centre)
    if (Math.abs(dot(relative, grip.across)) + bar.radius > grip.halfWidth || Math.abs(dot(relative, normal)) + bar.radius > grip.halfDepth) return new Error("Round bar leaves its palm opening")
    if (dot(sub([...edge], wrist), direction) - bar.radius <= 0) return new Error("Round bar reaches behind the native cuff plane")
  }

  return null
}
