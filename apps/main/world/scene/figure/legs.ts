import { buildLeg } from "#/world/scene/figure/build-leg"
import type { BodyContext } from "#/world/scene/figure/context"

export function buildLegs(context: BodyContext) {
  const left = buildLeg(context, "l")
  const right = buildLeg(context, "r")
  return {
    footwear: { l: left.footwear, r: right.footwear },
    knees: { l: left.knee, r: right.knee },
    trouserParts: [...left.trouserParts, ...right.trouserParts],
    parts: { l: left.parts, r: right.parts },
    shoeParts: { l: left.shoePart, r: right.shoePart },
  }
}
