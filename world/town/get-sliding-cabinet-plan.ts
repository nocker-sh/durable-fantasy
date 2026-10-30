import { getSlidingCabinetSpecError } from "#/world/town/get-sliding-cabinet-spec-error"
import { getSlidingCabinetFrameParts } from "#/world/town/get-sliding-cabinet-frame-parts"
import { getSlidingCabinetPanelParts } from "#/world/town/get-sliding-cabinet-panel-parts"
import { cuboidTranslationHits } from "../../lib/engine/cuboid-translation-hits"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { SlidingCabinetSpec } from "#/world/town/sliding-cabinet-types"
type Props = Readonly<{ spec: SlidingCabinetSpec; contents: readonly Cuboid[] }>

/** Each leaf stays supported in its own track for the complete translation, including the return; contents and the other leaf remain fixed. */
export function getSlidingCabinetPlan(props: Props) {
  const error = getSlidingCabinetSpecError(props.spec)
  if (error) return error
  if (props.contents.some((piece) => !Object.values(piece).every(Number.isFinite) || piece.x0 >= piece.x1 || piece.z0 >= piece.z1 || piece.bottom >= piece.top))
    return new Error("Invalid sliding cabinet contents")
  const spec = props.spec,
    b = spec.bounds,
    fixed = getSlidingCabinetFrameParts(spec),
    travel = { north: (b.z1 - b.z0 - 2 * spec.board - spec.overlap) / 2, south: spec.rearTravel }
  const closed = { north: getSlidingCabinetPanelParts({ spec, leaf: "north", offset: 0 }), south: getSlidingCabinetPanelParts({ spec, leaf: "south", offset: 0 }) },
    opposite = { north: closed.south, south: closed.north },
    direction = { north: 1, south: -1 }

  for (const leaf of ["north", "south"] satisfies ("north" | "south")[])
    for (const panel of closed[leaf]) {
      if (
        [...fixed, ...opposite[leaf], ...props.contents].some((obstacle) =>
          cuboidTranslationHits({ relative: panel, from: [0, 0, 0], to: [0, 0, direction[leaf] * travel[leaf]], obstacle: obstacle, tolerance: 1e-12 }),
        )
      )
        return new Error("Sliding cabinet leaf intersects a fixed board or stored object")
    }

  return {
    fixed,
    closed,
    travel,
    open: { north: getSlidingCabinetPanelParts({ spec, leaf: "north", offset: travel.north }), south: getSlidingCabinetPanelParts({ spec, leaf: "south", offset: -travel.south }) },
    cavity: { x0: b.x0 + 2 * spec.panel + 3 * spec.guide, x1: b.x1 - spec.board, z0: b.z0 + spec.board, z1: b.z1 - spec.board, bottom: spec.storageFloor, top: b.top - spec.board },
  }
}
