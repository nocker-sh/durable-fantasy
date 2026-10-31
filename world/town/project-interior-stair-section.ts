import { projectInteriorRectangle } from "#/world/town/project-interior-rectangle"
import type { StairSection } from "#/world/town/floorplan/stair-geometry"

type Props = Readonly<{ section: StairSection; x0: number; z0: number; scale: number }>

/** Horizontal and vertical stair dimensions use the same indoor presentation scale. */
export function projectInteriorStairSection(props: Props): StairSection {
  const section = props.section,
    scale = props.scale
  return {
    ...section,
    ...projectInteriorRectangle({ ...props, rect: section }),
    height: section.height * scale,
    slabThickness: section.slabThickness * scale,
    going: section.going * scale,
    landing: section.landing * scale,
    clearWidth: section.clearWidth * scale,
    railInset: section.railInset * scale,
    openingLength: section.openingLength * scale,
  }
}
