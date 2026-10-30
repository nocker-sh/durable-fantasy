import { qrot } from "#/lib/engine/qrot"
import { getNativeBimanualReachPose } from "#/world/scene/figure/get-native-bimanual-reach-pose"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = {
  look: Look
  skeleton: Skel
  profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error>
  pose: Exclude<ReturnType<typeof getPouringPotPose>, Error>
  body: readonly [number, number]
  heading: number
  gripOffset: number
  poles: Record<"l" | "r", Point3>
}

/** Reach the same rigid wooden bridge with native bone lengths and grounded feet; palm contact, load and heat remain separate. */
export function getPouringPotReachPose(props: Props) {
  if (![...props.body, props.heading, props.gripOffset].every(Number.isFinite) || props.gripOffset <= 0 || props.gripOffset >= props.profile.dimensions.gripLength / 2)
    return new Error("Invalid pouring pot hand positions")
  const targets = [-props.gripOffset, props.gripOffset].map((offset): Point3 => {
    const point = qrot(props.pose.rotation, [props.profile.dimensions.bailForward, props.profile.dimensions.bailHeight, offset])
    return [props.pose.at[0] + point[0], props.pose.at[1] + point[1], props.pose.at[2] + point[2]]
  })
  const solved = getNativeBimanualReachPose({ ...props, targets })
  if (solved instanceof Error) return new Error("Pouring pot cannot be reached with native arm lengths", { cause: solved })

  return solved
}
