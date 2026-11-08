import { scaleBedLinen } from "#/world/town/scale-bed-linen"
import type { BedSpec } from "#/world/town/bed-types"

/** Frame, mattress and made-bed pieces use the same projection into the indoor scene. */
export function scaleBed(bed: BedSpec, scale: number): BedSpec {
  if (!Number.isFinite(scale) || scale <= 0) throw new Error("Invalid bed scale")

  return {
    frameHeight: bed.frameHeight * scale,
    deckThickness: bed.deckThickness * scale,
    railWidth: bed.railWidth * scale,
    railHeight: bed.railHeight * scale,
    legWidth: bed.legWidth * scale,
    headHeight: bed.headHeight * scale,
    mattressThickness: bed.mattressThickness * scale,
    headSide: bed.headSide,
    linen: scaleBedLinen(bed.linen, scale),
  }
}
