import { pointRectDistance } from "#/lib/engine/point-rect-distance"
import type { EcologyFeature, EcologySite } from "#/scripts/lib/ecology-zone-schema"
type Props = { feature: EcologyFeature; grid: EcologySite["grid"] }
/** A named habitat feature needs its exact footprint and a usable adjacent approach, not just a matching legend. */
export function getEcologyFeatureErrors(props: Props): string[] {
  const rect = props.feature.rect,
    grid = props.grid,
    errors: string[] = []
  if (rect[0] + rect[2] > grid.rows[0].length || rect[1] + rect[3] > grid.rows.length) return [`${props.feature.symbol}: habitat feature leaves its grid`]
  if (grid.rows.some((row, z) => [...row].some((symbol, x) => (symbol === props.feature.symbol) !== (x >= rect[0] && x < rect[0] + rect[2] && z >= rect[1] && z < rect[1] + rect[3]))))
    errors.push(`${props.feature.symbol}: habitat footprint and grid disagree`)

  for (const access of props.feature.access) {
    if (!grid.rows[access[1]]?.[access[0]] || grid.rows[access[1]][access[0]] === "#") errors.push(`${props.feature.symbol}: habitat access is blocked or outside its grid`)
    if (pointRectDistance(access[0] + 0.5, access[1] + 0.5, [rect[0], rect[1], rect[0] + rect[2], rect[1] + rect[3]]) > 0.5 + 1e-9)
      errors.push(`${props.feature.symbol}: habitat access is not beside its feature`)
  }
  return errors
}
