import type { Interior } from "#/world/town/interiors"
import type { StairSection } from "#/world/town/floorplan/stair-geometry"

type Props = Readonly<{ interior: Interior; section: StairSection }>

/** Compare floor-local dimensions without treating the centred display origin as a physical position. */
export function getInteriorStairShape(props: Props): readonly number[] {
  const section = props.section,
    interior = props.interior
  return [
    section.x0 - interior.x0,
    section.z0 - interior.z0,
    section.x1 - interior.x0,
    section.z1 - interior.z0,
    section.height,
    section.slabThickness,
    section.risers,
    section.going,
    section.landing,
    section.clearWidth,
    section.railInset,
    section.openingLength,
  ]
}
