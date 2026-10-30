import { getPosedPotBottom } from "#/world/town/get-posed-pot-bottom"
import { getHotWaterPotGridError } from "./get-hot-water-pot-grid-error"
import { getHotWaterPotStationError } from "./get-hot-water-pot-station-error"
import type { HotWaterPosedContext as Props } from "./hot-water-frame-types"

/** 器の床・部屋の占有・台と杯の立体を、それぞれ省かずに照合する。 */
export function getHotWaterPotSpaceError(props: Props): Error | null {
  const bottom = getPosedPotBottom({ profile: props.definition.profile, pose: props.pose })
  if (!Number.isFinite(bottom) || bottom < 0) return new Error("Pouring pot intersects the room floor")
  const grid = getHotWaterPotGridError(props)
  if (grid) return grid
  return getHotWaterPotStationError(props)
}
