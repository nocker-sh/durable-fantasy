import { getSeatedForearmSelfError } from "#/world/scene/get-seated-forearm-self-error"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { createBodyContext } from "#/world/scene/figure/context"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = { look: Look; skeleton: Skel; root: Point3; heading: number; obstacles: readonly Cuboid[]; movingHand: "l" | "r" | null; margin: number; selfClearance?: boolean }
const sides: readonly ("l" | "r")[] = ["l", "r"]

/** Keep both arms against table bounds; authored motion additionally checks its moving forearm against the fixed body. */
export function getSeatedArmClearanceError(props: Props): Error | null {
  if (
    !Number.isFinite(props.margin) ||
    props.margin < 0 ||
    ![...props.root, props.heading].every(Number.isFinite) ||
    props.obstacles.some((box) => ![box.x0, box.x1, box.z0, box.z1, box.bottom, box.top].every(Number.isFinite) || box.x0 >= box.x1 || box.z0 >= box.z1 || box.bottom >= box.top)
  )
    return new Error("Invalid seated arm clearance geometry")
  const scale = createBodyContext(props.look, props.skeleton, null).S
  for (const side of sides) {
    const shape = nativeArmSurfaces({ scale: scale, shoulder: props.skeleton.p[`upperarm_${side}`], elbow: props.skeleton.p[`lowerarm_${side}`], wrist: props.skeleton.p[`hand_${side}`] })
    for (const capsule of [...shape.arm.capsuleBounds(), ...shape.uncutCuff.capsuleBounds()]) {
      const from = toHeadingWorldPoint(capsule.a, props.root, props.heading),
        to = toHeadingWorldPoint(capsule.b, props.root, props.heading)
      if (![...from, ...to, capsule.r].every(Number.isFinite) || capsule.r <= 0) return new Error("Invalid native seated arm geometry")
      for (const obstacle of props.obstacles)
        if (segmentCuboidDistance(obstacle, from, to) < capsule.r + (props.movingHand === side ? props.margin : 0))
          return new Error(`Seated ${side} arm or cuff intersects tableware or the table`, { cause: { side, from, to, radius: capsule.r, obstacle } })
    }
  }

  if (props.selfClearance) return getSeatedForearmSelfError(props)
  return null
}
