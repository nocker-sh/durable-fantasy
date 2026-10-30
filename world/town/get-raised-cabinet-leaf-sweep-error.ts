import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { SlidingCabinetPart } from "#/world/town/sliding-cabinet-types"
type Props = Readonly<{ parts: readonly SlidingCabinetPart[]; obstacles: readonly Cuboid[]; offset: Point3 }>

/** A rigid leaf's attached hardware cannot be omitted from a complete sweep or its failure diagnosis. */
export function getRaisedCabinetLeafSweepError(props: Props): Error | null {
  for (const piece of props.parts) {
    const obstacle = props.obstacles.findIndex((other) => cuboidTranslationHits({ relative: piece, from: [0, 0, 0], to: props.offset, obstacle: other, tolerance: 1e-12 }))
    if (obstacle >= 0) return new Error("Raised cabinet handle or solid panel intersects an obstacle", { cause: { leaf: piece.leaf, part: piece.part, obstacle } })
  }

  return null
}
