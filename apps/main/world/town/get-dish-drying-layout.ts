import { getDryingDishBoxes } from "#/world/town/get-drying-dish-boxes"
import { getDryingGridSupport } from "#/world/town/get-drying-grid-support"
export type DryingDish = { id: string; width: number; depth: number; height: number; position: readonly [number, number]; rimRadius: number | null; rimCenter?: readonly [number, number] }
type Props = {
  width: number
  depth: number
  airGap: number
  tray: { width: number; depth: number; height: number; wall: number }
  grid: { width: number; depth: number; frameBottom: number; frameWidth: number; frameThickness: number; barWidth: number; gap: number; margin: number; footWidth: number }
  dishes: readonly DryingDish[]
}

/** Place outer bounds and model static rim contact; strength and drying performance remain separate. */
export function getDishDryingLayout(props: Props) {
  const dimensions = [props.width, props.depth, props.airGap, ...Object.values(props.tray), ...Object.values(props.grid)]
  if (dimensions.some((value) => !Number.isFinite(value) || value <= 0) || !props.dishes.length) return new Error("Invalid dish drying dimensions")
  if (
    props.tray.width > props.width ||
    props.tray.depth > props.depth ||
    props.tray.wall >= props.tray.height ||
    props.grid.width > props.tray.width - props.tray.wall * 2 ||
    props.grid.depth > props.tray.depth - props.tray.wall * 2
  )
    return new Error("Drying tray or grid leaves its support")
  if (props.grid.barWidth >= Math.min(props.grid.width, props.grid.depth)) return new Error("Drying bars leave the grid")
  if (props.grid.frameBottom < props.tray.height - props.tray.wall) return new Error("Drying grid is below the tray rim")
  if (props.dishes.some((dish) => dish.width <= props.grid.gap)) return new Error("Drying dish can fall between grid bars")
  const boxes = getDryingDishBoxes({ dishes: props.dishes, width: props.grid.width, depth: props.grid.depth, airGap: props.airGap })
  if (boxes instanceof Error) return boxes
  const grid = getDryingGridSupport({ dishes: props.dishes, grid: props.grid })
  if (grid instanceof Error) return grid
  const gridTop = props.tray.wall + props.grid.frameBottom + grid.grid.top
  const trayInnerVolume = (props.tray.width - props.tray.wall * 2) * (props.tray.depth - props.tray.wall * 2) * (props.tray.height - props.tray.wall)
  if (![gridTop, trayInnerVolume].every(Number.isFinite) || trayInnerVolume <= 0) return new Error("Invalid dish drying dimensions")

  return { boxes, gridTop, trayInnerVolume, grid }
}
