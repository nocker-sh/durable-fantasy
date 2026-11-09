import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Readonly<{ look: Look; skeleton: Skel; target: Point3; body: readonly [number, number]; heading: number; hand: "l" | "r"; pole: Point3 }>

/** Move only the selected elbow and wrist; reaching an anchor grants no palm contact, strength or cane-support certificate. */
export function getNativeSingleHandReachPose(props: Props) {
  if (![...props.target, ...props.body, props.heading, ...props.pole].every(Number.isFinite) || !["l", "r"].includes(props.hand)) return new Error("Invalid native single-hand reach")
  if (Object.keys(props.skeleton.handGrips ?? {}).length) return new Error("Native single-hand reach must precede contact constraints")
  const rootY = groundFootwear(buildBody(props.look, props.skeleton, null).footwear).rootY
  const target = toHeadingLocalPoint(props.target, [props.body[0], rootY, props.body[1]], props.heading)
  const solution = solveArmGrip({ skeleton: props.skeleton, side: props.hand, target: [...target], pole: [...props.pole] })
  if (!solution) return new Error("Native single-hand target is unreachable without stretching the arm")
  const skeleton = { ...props.skeleton, p: { ...props.skeleton.p, [`lowerarm_${props.hand}`]: solution.elbow, [`hand_${props.hand}`]: solution.wrist } }

  return { skeleton, rootY, solution, target }
}
