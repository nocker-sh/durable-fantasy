import { stairGeometry } from "#/world/town/floorplan/stair-geometry"
import { getInteriorStairShape } from "#/world/town/get-interior-stair-shape"
import { assertInteriorStairElevations } from "#/world/town/assert-interior-stair-elevations"
import type { Interior } from "#/world/town/interiors"
import type { StairSection } from "#/world/town/floorplan/stair-geometry"

type Props = Readonly<{ lower: Interior; upper: Interior; section: StairSection }>

/** A stair has one physical shape, even though each floor stores its own projected view. */
export function getMatchingInteriorStairSection(props: Props): StairSection {
  const matches = props.upper.stairSections?.filter((section) => section.id === props.section.id) ?? [],
    upper = matches[0],
    lower = props.section
  if (matches.length !== 1 || !upper || upper.lowerFloor !== lower.lowerFloor || upper.upperFloor !== lower.upperFloor || upper.axis !== lower.axis || upper.lowerEnd !== lower.lowerEnd)
    throw new Error(`Stair floor views disagree: ${lower.id}`)
  const lowerShape = getInteriorStairShape({ interior: props.lower, section: lower }),
    upperShape = getInteriorStairShape({ interior: props.upper, section: upper })
  if (lowerShape.some((value, index) => !Number.isFinite(value) || !Number.isFinite(upperShape[index]) || Math.abs(value - upperShape[index]) > 1e-6))
    throw new Error(`Stair floor views disagree: ${lower.id}`)
  stairGeometry(lower)
  stairGeometry(upper)
  assertInteriorStairElevations(props)
  return upper
}
