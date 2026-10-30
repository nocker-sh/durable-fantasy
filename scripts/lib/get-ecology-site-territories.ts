import type { EcologySite } from "#/scripts/lib/ecology-zone-schema"
import type { Spawn } from "#/world/core/monster-types"
type Props = { site: EcologySite; territories: ReadonlyArray<Spawn["area"]> }
/** A connected site must fit a registered territory instead of bridging separate populations across the map. */
export function getEcologySiteTerritories(props: Props): ReadonlyArray<Spawn["area"]> {
  const grid = props.site.grid,
    x = grid.origin_tiles[0],
    z = grid.origin_tiles[1]
  const right = x + grid.rows[0].length * grid.cell_tiles,
    bottom = z + grid.rows.length * grid.cell_tiles
  return props.territories.filter((area) => x >= area[0] && z >= area[1] && right <= area[2] && bottom <= area[3])
}
