import { cookingTopSchema } from "#/scripts/lib/cooking-top-schema"
import type { CookingTopSpec } from "#/world/town/get-cooking-top-box"

/** Settings retain authorship and pending operations; the physical drawing receives only its measured top. */
export function getCookingTop(value: unknown): CookingTopSpec | Error {
  const parsed = cookingTopSchema.safeParse(value)
  if (!parsed.success) return new Error("Invalid cooking top proposal")

  return { thickness: parsed.data.thickness_m, frontDepth: parsed.data.front_depth_m, minimumBearing: parsed.data.minimum_bearing_m }
}
