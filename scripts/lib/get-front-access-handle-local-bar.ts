import { getVerticalCuboidGripBar } from "#/world/scene/figure/get-vertical-cuboid-grip-bar"
import type { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
type Props = Readonly<{ plan: Exclude<ReturnType<typeof getFrontAccessHandlePlan>, Error>; rootY: number }>

/** The physical handle and actor translate together; construct their invariant relative bar once from actual dimensions, with conservative floating-point padding. */
export function getFrontAccessHandleLocalBar(props: Props) {
  const plan = props.plan,
    h = plan.handle,
    offset = plan.source.body_from_bar_m,
    bounds = plan.section.bounds
  const padding = 1e-12 * (1 + Math.max(...Object.values(bounds).map(Math.abs)) + plan.section.ceiling + Math.hypot(...offset) + h.height + h.thickness)
  const half = h.thickness / 2 + padding

  return getVerticalCuboidGripBar({
    box: { x0: -offset[0] - half, x1: -offset[0] + half, z0: -offset[1] - half, z1: -offset[1] + half, bottom: h.centreY - h.height / 2 - padding, top: h.centreY + h.height / 2 + padding },
    root: [0, props.rootY, 0],
    heading: Math.PI / 2,
  })
}
