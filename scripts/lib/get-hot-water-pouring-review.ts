import { seatHeading } from "#/world/town/seat-heading"
import { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import { getCupDefinition } from "#/scripts/lib/get-cup-definition"
import { getHotWaterCupLayout } from "#/scripts/lib/get-hot-water-cup-layout"
import { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
import { getPosedPotBottom } from "#/world/town/get-posed-pot-bottom"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { hotWaterServiceSchema } from "#/scripts/lib/hot-water-service-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = { room: SettingDocument; plan: z.infer<typeof hotWaterServiceSchema>; profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error> }

/** A static open-pot review keeps the whole vessel above every cup rim; it does not approve a movement or water trajectory. */
export function getHotWaterPouringReview(props: Props) {
  const layout = getHotWaterCupLayout(props),
    dishes = dishDryingSchema.safeParse(props.room.dish_drying),
    review = props.plan.serving.pose_review
  if (layout instanceof Error) return layout
  if (!dishes.success || !layout.table.work_surface) return new Error("Pouring review has no measured receiving cups")
  const height = layout.table.work_surface.height_m,
    rim = height + Math.max(...layout.boxes.map((box) => box.size[1])),
    poses = []
  for (const box of layout.boxes) {
    const item = dishes.data.items.find((dish) => dish.id === box.id)
    if (!item) return new Error("Pouring review cup is unavailable")
    const cup = getCupDefinition(item)
    if (cup instanceof Error) return cup
    const pose = getPouringPotPose({
      profile: props.profile,
      lipAt: [box.origin[0] + cup.centre[0], height + cup.height + review.lip_above_rim_m, box.origin[2] + cup.centre[1]],
      heading: seatHeading(review.lip_facing) - Math.PI / 2,
      tilt: (review.tilt_degrees * Math.PI) / 180,
    })
    if (pose instanceof Error) return pose
    const bottom = getPosedPotBottom({ profile: props.profile, pose })
    if (bottom <= rim) return new Error("Tilted pot leaves no clearance above the receiving cups")
    poses.push({ cup: item.id, pose, bottom })
  }

  return { layout, poses }
}
