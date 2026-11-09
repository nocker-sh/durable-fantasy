import type { DryingDish } from "#/world/town/get-dish-drying-layout"

/** An asymmetric vessel's contact ring must still lie inside its measured full envelope. */
export function getDryingRimError(dish: DryingDish): Error | null {
  const radius = dish.rimRadius
  if (radius === null) return null
  const centre = dish.rimCenter ?? [dish.width / 2, dish.depth / 2]
  if (![radius, ...centre].every(Number.isFinite) || radius <= 0 || centre.some((value, axis) => value < radius || value + radius > [dish.width, dish.depth][axis]))
    return new Error("Drying rim leaves its measured vessel envelope")

  return null
}
