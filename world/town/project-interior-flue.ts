import { projectInteriorRectangle } from "#/world/town/project-interior-rectangle"
import type { FlueSection } from "#/world/town/floorplan/types"

type Props = Readonly<{ section: FlueSection; x0: number; z0: number; scale: number }>

/** A flue's footprint, collar and support stay in the same indoor presentation units. */
export function projectInteriorFlue(props: Props): FlueSection {
  const section = props.section,
    scale = props.scale
  return {
    ...section,
    wallThickness: section.wallThickness * scale,
    floorCollar: section.floorCollar * scale,
    floorSupport: { depth: section.floorSupport.depth * scale, steps: section.floorSupport.steps },
    ...projectInteriorRectangle({ ...props, rect: section }),
  }
}
