import { projectInteriorStairSection } from "#/world/town/project-interior-stair-section"
import { stairGeometry } from "#/world/town/floorplan/stair-geometry"
import type { FloorPlan } from "#/world/town/floorplan/types"

type Props = Readonly<{ sections: FloorPlan["stairSections"]; floor: number; x0: number; z0: number; scale: number }>

/** Derive the floor opening and collision block from the same projected physical flight. */
export function getInteriorStairProjection(props: Props) {
  const stairSections = props.sections
    ?.filter((section) => section.lowerFloor === props.floor || section.upperFloor === props.floor)
    .map((section) => projectInteriorStairSection({ ...props, section }))
  const floorOpenings = stairSections?.filter((section) => section.upperFloor === props.floor).map((section) => stairGeometry(section).opening)
  const stairBlocks = stairSections?.map((section) => (section.upperFloor === props.floor ? stairGeometry(section).opening : stairGeometry(section).flight))
  return { stairSections, floorOpenings, stairBlocks }
}
