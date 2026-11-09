import { subtractRectangles, type Rectangle } from "#/lib/engine/rectangle-subtraction"
import type { FlueSection } from "#/world/town/floorplan/types"

/** Replace timber around a penetrating shaft; stair openings remain open in both materials. */
export function flueFloor(inputProps: { bounds: Rectangle; floor: number; flues: readonly FlueSection[]; openings: readonly Rectangle[] }) {
  const bounds = inputProps.bounds
  const floor = inputProps.floor
  const flues = inputProps.flues
  const openings = inputProps.openings

  const shafts = flues.filter((flue) => flue.upperFloor === floor)
  const collars = shafts.map((shaft) => {
    const c = shaft.floorCollar
    if (!Number.isFinite(c) || c <= 0) throw new Error("Flue floor collar must be positive")
    return { x0: shaft.x0 - c, z0: shaft.z0 - c, x1: shaft.x1 + c, z1: shaft.z1 + c }
  })
  const timber = subtractRectangles(bounds, [...openings, ...collars])
  // A partition of the whole surface avoids duplicate stone where collars overlap.
  const stone = subtractRectangles(bounds, [...openings, ...shafts, ...timber])
  return { timber, stone }
}
