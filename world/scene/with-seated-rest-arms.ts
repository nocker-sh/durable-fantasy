import { solveArmGripPose } from "#/world/scene/figure/solve-arm-grip-pose"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import type { Skel } from "#/world/scene/rig"
import type { SeatedPlace } from "#/world/scene/seated-pose"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
export type SeatedArmRest = Readonly<Record<"l" | "r", { readonly seat_target_m: Point3; readonly pole: Point3 }>>
type Props = { skeleton: Skel; root: Point3; place: SeatedPlace; rest: SeatedArmRest }
const hands: readonly ("l" | "r")[] = ["l", "r"]

/** Authored resting hands replace only their two arm chains; the seated support and native proportions stay fixed. */
export function withSeatedRestArms(props: Props): Skel | Error {
  return hands.reduce<Skel | Error>((skeleton, hand) => {
    if (skeleton instanceof Error) return skeleton
    const rest = props.rest[hand]
    if (![...rest.seat_target_m, ...rest.pole].every(Number.isFinite)) return new Error("Invalid seated resting arm")
    const world = toHeadingWorldPoint(rest.seat_target_m, [props.place.at[0], 0, props.place.at[1]], props.place.heading)
    const target = toHeadingLocalPoint(world, props.root, props.place.heading)
    const pose = solveArmGripPose({ skeleton, hand, target, pole: rest.pole })
    if (pose instanceof Error) return new Error(`Seated resting ${hand} arm is unreachable`, { cause: pose })

    return pose.skeleton
  }, props.skeleton)
}
