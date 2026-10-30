import { getHotWaterPosedFrame } from "#/scripts/lib/get-hot-water-posed-frame"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import type { HotWaterAnimationContext } from "#/scripts/lib/hot-water-frame-types"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = HotWaterAnimationContext & Readonly<{ placed: HotWaterAnimationContext["review"]["poses"][number] }>

/** Translate the pot and actor into the same room coordinates once before solving the grounded native frame. */
export function getHotWaterReachFrame(props: Props) {
  if (!props.room.grid) return new Error("Pouring frame has no room grid")
  const table = props.review.layout.table,
    x = table.rect[0] * props.room.grid.cell_m,
    z = table.rect[1] * props.room.grid.cell_m,
    source = props.definition.plan.serving.pose_review.reach_review,
    original = props.placed.pose
  const body: readonly [number, number] = [x + original.lipAt[0] + source.body_from_lip_m[0], z + original.lipAt[2] + source.body_from_lip_m[1]],
    pose = {
      ...original,
      at: [x + original.at[0], original.at[1], z + original.at[2]] satisfies Point3,
      lipAt: [x + original.lipAt[0], original.lipAt[1], z + original.lipAt[2]] satisfies Point3,
      gripAt: [x + original.gripAt[0], original.gripAt[1], z + original.gripAt[2]] satisfies Point3,
    }
  const skeleton = skelFor(props.look, props.animation, props.frame)

  return getHotWaterPosedFrame({ ...props, body, pose, skeleton })
}
