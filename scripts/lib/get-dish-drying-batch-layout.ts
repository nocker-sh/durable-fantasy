import { getDryingDishes } from "#/scripts/lib/get-drying-dishes"
import { getDishDryingLayout } from "#/world/town/get-dish-drying-layout"
import type { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import type { z } from "zod"
type Plan = z.infer<typeof dishDryingSchema>
type Props = { width: number; depth: number; plan: Plan; items: Plan["items"] }

/** All batches share the same tray and rack; only the objects present at that time change. */
export function getDishDryingBatchLayout(props: Props): ReturnType<typeof getDishDryingLayout> {
  const plan = props.plan,
    dishes = getDryingDishes({ ...plan, items: props.items })
  if (dishes instanceof Error) return dishes

  return getDishDryingLayout({
    width: props.width,
    depth: props.depth,
    tray: { width: plan.tray.width_m, depth: plan.tray.depth_m, height: plan.tray.height_m, wall: plan.tray.wall_m },
    grid: {
      width: plan.grid.width_m,
      depth: plan.grid.depth_m,
      frameBottom: plan.grid.frame_bottom_above_tray_floor_m,
      frameWidth: plan.grid.frame_width_m,
      frameThickness: plan.grid.frame_thickness_m,
      footWidth: plan.grid.foot_width_m,
      barWidth: plan.grid.bar_width_m,
      gap: plan.grid.gap_m,
      margin: plan.grid.min_support_margin_m,
    },
    airGap: plan.min_air_gap_m,
    dishes,
  })
}
