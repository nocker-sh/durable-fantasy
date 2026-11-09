import { hearthParts } from "#/world/town/hearth-parts"
import { getCookingTopBox } from "#/world/town/get-cooking-top-box"
import { subtractCuboids } from "#/lib/engine/cuboid-subtraction"
import type { FlueSection } from "#/world/town/floorplan/types"
type Props = Parameters<typeof getCookingTopBox>[0] & { shaft: FlueSection }

/** The plate replaces masonry while the smoke duct remains open and the original firebox keeps its geometry. */
export function getCookingHearthParts(props: Props) {
  try {
    const plate = getCookingTopBox(props)
    if (plate instanceof Error) return plate
    const structure = hearthParts({ bounds: props.bounds, front: props.front, spec: props.hearth, shaft: props.shaft, bottom: props.bottom }),
      throat = structure.throat
    if (plate.x0 < throat.x1 && plate.x1 > throat.x0 && plate.z0 < throat.z1 && plate.z1 > throat.z0) return new Error("Cooking plate obstructs the smoke duct")

    return { ...structure, plate, masonry: structure.masonry.flatMap((part) => subtractCuboids(part, [plate])) }
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid cooking hearth")
  }
}
