import { getBowlProfile } from "#/world/town/get-bowl-profile"
import { getCupDefinition } from "#/scripts/lib/get-cup-definition"
import type { DryingDish } from "#/world/town/get-dish-drying-layout"
import type { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import type { z } from "zod"
type Dish = z.infer<typeof dishDryingSchema>["items"][number]

/** Rim contacts follow the hollow body; asymmetric handles stay in the clearance envelope. */
export function getDryingDish(item: Dish): DryingDish | Error {
  const bounds = { id: item.id, width: item.width_m, height: item.height_m, depth: item.depth_m, position: item.drying_position_m }
  if (item.kind === "spoon") {
    if (item.drying_orientation !== "flat") return new Error("Drying spoons must lie flat")
    return { ...bounds, rimRadius: null }
  }
  if (item.drying_orientation !== "inverted") return new Error("Drying bowls must drain upside down")
  if (item.kind === "cup") {
    const cup = getCupDefinition(item)
    if (cup instanceof Error) return cup
    return { ...bounds, rimRadius: cup.bowl.rimContactRadius, rimCenter: cup.centre }
  }
  if (!item.bowl || item.width_m !== item.depth_m) return new Error("Bowl shape does not match its round outer bounds")
  const profile = getBowlProfile({ diameter: item.width_m, height: item.height_m, baseDiameter: item.bowl.base_diameter_m, wall: item.bowl.radial_wall_m, bottom: item.bowl.bottom_m })
  if (profile instanceof Error) return profile

  return { ...bounds, rimRadius: profile.rimContactRadius }
}
