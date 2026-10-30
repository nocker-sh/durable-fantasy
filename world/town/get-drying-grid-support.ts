import { getDryingGridLayout } from "#/world/town/get-drying-grid-layout"
import { getDryingRimError } from "#/world/town/get-drying-rim-error"
import type { DryingDish } from "#/world/town/get-dish-drying-layout"
type Props = { dishes: readonly DryingDish[]; grid: Omit<Parameters<typeof getDryingGridLayout>[0], "bowls"> }

/** Use the actual body ring of asymmetric cups instead of centring contact on the handle-inclusive bounds. */
export function getDryingGridSupport(props: Props): ReturnType<typeof getDryingGridLayout> {
  for (const dish of props.dishes) {
    const error = getDryingRimError(dish)
    if (error) return error
  }
  const bowls = props.dishes.flatMap((dish) =>
    dish.rimRadius === null
      ? []
      : [{ id: dish.id, centerX: dish.position[0] + (dish.rimCenter?.[0] ?? dish.width / 2), centerZ: dish.position[1] + (dish.rimCenter?.[1] ?? dish.depth / 2), radius: dish.rimRadius }],
  )

  return getDryingGridLayout({ ...props.grid, bowls })
}
