import { getInteriorMapSpace } from "#/world/town/get-interior-map-space"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import type { Interior } from "#/world/town/interiors"
import type { StairSection } from "#/world/town/floorplan/stair-geometry"

type Props = Readonly<{ lower: Interior; upper: Interior; section: StairSection }>

/** Known placements must share one building frame and the flight must reach the actual upper floor. */
export function assertInteriorStairElevations(props: Props): void {
  const lower = getInteriorMapSpace(props.lower),
    upper = getInteriorMapSpace(props.upper)
  if (!lower && !upper) return
  if (!lower || !upper) throw new Error(`Stair floor elevations disagree: ${props.section.id}`)
  const lowerFrame = lower.frame,
    upperFrame = upper.frame
  const actual = [upperFrame.origin[0], upperFrame.origin[2], upperFrame.width, upperFrame.depth, upperFrame.quarterTurns, upperFrame.origin[1] - lowerFrame.origin[1], props.upper.floorThickness]
  const expected = [lowerFrame.origin[0], lowerFrame.origin[2], lowerFrame.width, lowerFrame.depth, lowerFrame.quarterTurns, props.section.height / ROOM_SCALE, props.section.slabThickness]
  if (lower.parentMap !== upper.parentMap || actual.some((value, index) => typeof value !== "number" || !Number.isFinite(value) || Math.abs(value - expected[index]) > 1e-6))
    throw new Error(`Stair floor elevations disagree: ${props.section.id}`)
}
