import { bedParts } from "#/world/town/bed-parts"
import { getBedLinenDefinition } from "#/scripts/lib/get-bed-linen-definition"
import { bedDimensionsSchema } from "#/scripts/lib/bed-dimensions-schema"
import type { BedSpec } from "#/world/town/bed-types"

/** Parse authored measurements before constructing the same frame and mattress used for drawing. */
export function bedDimensions(value: unknown, width: number, depth: number): BedSpec {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Missing bed dimensions")
  const parsed = bedDimensionsSchema.safeParse(value)
  if (!parsed.success) throw new Error("Invalid bed dimensions")
  const source = parsed.data,
    bed: BedSpec = {
      frameHeight: source.frame_height_m,
      deckThickness: source.deck_thickness_m,
      railWidth: source.rail_width_m,
      railHeight: source.rail_height_m,
      legWidth: source.leg_width_m,
      headHeight: source.head_height_m,
      mattressThickness: source.mattress_thickness_m,
      headSide: source.head_side,
      linen: getBedLinenDefinition(source.linen),
    }
  bedParts({ at: [0, 0], size: [width, depth], floor: 0, bed })

  return bed
}
