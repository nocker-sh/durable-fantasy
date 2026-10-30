import type { HandGrip } from "#/world/scene/rig"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { crossVector3 as cross } from "#/lib/engine/cross-vector3"
import { NATIVE_ARM_SHAPE } from "#/world/scene/figure/arm-shape"

type Props = {
  scale: number
  shoulder: V3
  elbow: V3
  wrist: V3
  grip?: HandGrip
}

/** The renderer and clearance certificates use the same arm and cuff control points and radii. */
export function nativeArmSurfaces(props: Props) {
  const direction = norm(sub(props.wrist, props.elbow)),
    cuff = limbSd(
      NATIVE_ARM_SHAPE.cuff.map((c) => lerp3(props.elbow, props.wrist, c)),
      [0.057 * props.scale, 0.062 * props.scale],
    )
  const raw = limbSd(
    [props.shoulder, props.elbow, props.wrist, ...NATIVE_ARM_SHAPE.palm.map((c) => add(props.wrist, mul(direction, c * props.scale)))],
    NATIVE_ARM_SHAPE.radii.map((r) => r * props.scale),
  )
  const arm = { value: raw }
  if (props.grip) {
    const gripProfile = props.grip,
      axis = gripProfile.axis,
      across = gripProfile.across,
      halfWidth = gripProfile.halfWidth,
      halfDepth = gripProfile.halfDepth,
      centre = armGripPoint(props.elbow, props.wrist),
      palmCentre = add(props.wrist, mul(direction, NATIVE_ARM_SHAPE.palm[0] * props.scale)),
      core = NATIVE_ARM_SHAPE.radii[3] * props.scale - Math.hypot(...sub(centre, palmCentre))
    if (
      ![...axis, ...across, halfWidth, halfDepth].every(Number.isFinite) ||
      Math.abs(Math.hypot(...axis) - 1) > 1e-9 ||
      Math.abs(Math.hypot(...across) - 1) > 1e-9 ||
      Math.abs(dot(axis, across)) > 1e-9 ||
      halfWidth <= 0 ||
      halfDepth <= 0 ||
      Math.hypot(halfWidth, halfDepth) >= core
    )
      throw new Error("Invalid native palm grip profile")
    const normal = cross(across, axis)
    // town.md「作業姿勢の掌と柄の接触」: retain the forearm and existing material classification.
    arm.value = {
      ...raw,
      sd: (p, hit) => {
        const q = sub(p, centre),
          opening = Math.max(Math.abs(dot(q, across)) - halfWidth, Math.abs(dot(q, normal)) - halfDepth, -dot(sub(p, props.wrist), direction))
        return Math.max(raw.sd(p, hit), -opening)
      },
    }
  }
  return {
    direction,
    palm: { centre: add(props.wrist, mul(direction, NATIVE_ARM_SHAPE.palm[0] * props.scale)), radius: NATIVE_ARM_SHAPE.radii[3] * props.scale, fromWrist: NATIVE_ARM_SHAPE.palm[0] * props.scale },
    arm: arm.value,
    forearm: () =>
      limbSd(
        [props.elbow, props.wrist, ...NATIVE_ARM_SHAPE.palm.map((c) => add(props.wrist, mul(direction, c * props.scale)))],
        NATIVE_ARM_SHAPE.radii.slice(1).map((r) => r * props.scale),
      ),
    uncutCuff: cuff,
    // The rounded cuff must end at the wrist rather than fill the palm grip.
    cuff: { ...cuff, sd: (p: V3) => Math.max(cuff.sd(p), dot(sub(p, props.wrist), direction)) },
  }
}
