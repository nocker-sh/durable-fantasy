import { bedParts } from "#/world/town/bed-parts"
import { M } from "#/world/scene/construction/materials"
import { INTERIOR_CLOTH } from "#/world/scene/construction/interior-cloth-materials"
import type { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { BedSpec } from "#/world/town/bed-types"
import type { Material } from "three"
type Props = { builder: GB; at: readonly [number, number]; size: readonly [number, number]; floor: number; bed: BedSpec; mattress: Material }

/** Authored bed rendering consumes the same frame, deck and mattress sections as the settings checks. */
export function addMeasuredBed(props: Props): void {
  const materials = { frame: M.woodDark, deck: M.woodDark, mattress: props.mattress, pillow: props.mattress, blanket: INTERIOR_CLOTH[1] }
  for (const part of bedParts({ at: props.at, size: props.size, floor: props.floor, bed: props.bed })) {
    const material = materials[part.kind]
    props.builder.box({ side: material, top: material, x0: part.x0, y0: part.y0, z0: part.z0, x1: part.x1, y1: part.y1, z1: part.z1, repeat: 2 })
  }
}
