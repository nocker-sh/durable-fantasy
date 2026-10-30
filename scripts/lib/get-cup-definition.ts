import { getCupProfile } from "#/world/town/get-cup-profile"
import type { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import type { z } from "zod"
type Dish = z.infer<typeof dishDryingSchema>["items"][number]

/** The handle belongs to the item's full storage and drying envelope, while rim contact uses the off-centre cup body. */
export function getCupDefinition(item: Dish) {
  const cup = item.cup
  if (item.kind !== "cup" || !cup) return new Error("Missing measured cup")
  const profile = getCupProfile({
    diameter: cup.body_diameter_m,
    height: item.height_m,
    baseDiameter: cup.base_diameter_m,
    wall: cup.radial_wall_m,
    bottom: cup.bottom_m,
    handleGap: cup.handle_gap_m,
    handleRadius: cup.handle_radius_m,
    handleBottom: cup.handle_bottom_m,
    handleTop: cup.handle_top_m,
  })
  if (profile instanceof Error) return profile
  if (Math.abs(profile.width - item.width_m) > 1e-9 || profile.depth !== item.depth_m) return new Error("Cup handle or body disagrees with its outer bounds")

  return profile
}
