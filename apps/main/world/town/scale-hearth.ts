import type { HearthSpec } from "#/world/town/hearth-types"
export function scaleHearth(spec: HearthSpec, k: number): HearthSpec {
  return {
    height: spec.height * k,
    openingBottom: spec.openingBottom * k,
    openingTop: spec.openingTop * k,
    openingWidth: spec.openingWidth * k,
    openingOffset: spec.openingOffset * k,
    chamberDepth: spec.chamberDepth * k,
  }
}
