import { getPouringPotNativePoint } from "#/world/scene/figure/get-pouring-pot-native-point"
import type { getPouringPotReachPose } from "#/world/scene/figure/get-pouring-pot-reach-pose"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
type Props = Pick<Parameters<typeof getPouringPotReachPose>[0], "profile" | "pose" | "body" | "heading"> & { rootY: number }

/** Transform the whole wooden sleeve, not a smaller contact-only substitute, to the grounded figure's frame. */
export function getPouringPotWoodenBar(props: Props): RoundGripBar {
  const p = props.profile.dimensions
  const point = (offset: number) => getPouringPotNativePoint({ ...props, point: [p.bailForward, p.bailHeight, offset] })

  return { from: point(-p.gripLength / 2), to: point(p.gripLength / 2), radius: p.gripRadius }
}
