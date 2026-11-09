import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"
import type { DryingDish } from "#/world/town/get-dish-drying-layout"
type Props = { dishes: readonly DryingDish[]; width: number; depth: number; airGap: number }
type Box = { id: string; origin: [number, number, number]; size: [number, number, number] }

/** The complete handle and body envelopes must fit with air gaps within the group present on the rack. */
export function getDryingDishBoxes(props: Props): Box[] | Error {
  const boxes = props.dishes.map((dish) => ({
    id: dish.id,
    origin: [dish.position[0], 0, dish.position[1]] satisfies [number, number, number],
    size: [dish.width, dish.height, dish.depth] satisfies [number, number, number],
  }))
  const height = props.dishes.reduce((maximum, dish) => Math.max(maximum, dish.height), 0)
  const error = getBoxLayoutError({ size: [props.width, height, props.depth], boxes, gap: props.airGap })

  return error ?? boxes
}
