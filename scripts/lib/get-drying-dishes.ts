import { getDryingDish } from "#/scripts/lib/get-drying-dish"
import type { DryingDish } from "#/world/town/get-dish-drying-layout"
import type { dishDryingSchema } from "#/scripts/lib/dish-drying-schema"
import type { z } from "zod"
type Plan = z.infer<typeof dishDryingSchema>

/** Resolve every object rather than dropping a malformed vessel from its assigned drying group. */
export function getDryingDishes(plan: Plan): readonly DryingDish[] | Error {
  const dishes: DryingDish[] = []
  for (const item of plan.items) {
    const dish = getDryingDish(item)
    if (dish instanceof Error) return dish
    dishes.push(dish)
  }

  return dishes
}
