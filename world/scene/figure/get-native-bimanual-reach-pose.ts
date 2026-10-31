import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import { getNativeFootwear } from "#/world/scene/figure/get-native-footwear"
import { groundFootwear } from "#/world/scene/figure/footing"
import { solveBimanualGrip } from "#/world/scene/figure/solve-bimanual-grip"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { look: Look; skeleton: Skel; targets: readonly Point3[]; body: readonly [number, number]; heading: number; poles: Record<"l" | "r", Point3> }

/** Ground native footwear once and solve both palms in the actor's frame; bone lengths and shoulders remain unchanged. */
export function getNativeBimanualReachPose(props: Props) {
  if (props.targets.length !== 2 || ![...props.body, props.heading, ...props.targets.flat(), ...props.poles.l, ...props.poles.r].every(Number.isFinite))
    return new Error("Invalid native bimanual reach targets")
  const rootY = groundFootwear(getNativeFootwear(props.look, props.skeleton)).rootY
  const points = props.targets.map((point) => toHeadingLocalPoint(point, [props.body[0], rootY, props.body[1]], props.heading)).sort((first, second) => first[0] - second[0])
  const grips = { l: points[1], r: points[0] },
    solved = solveBimanualGrip({ skeleton: props.skeleton, grips, poles: props.poles })
  if (solved instanceof Error) return solved

  return { ...solved, grips, rootY }
}
