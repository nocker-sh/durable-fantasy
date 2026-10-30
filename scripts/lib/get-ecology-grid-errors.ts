import { walkable } from "#/world/maps/walkable"
import { type MapDefinition } from "#/world/maps/types"
import { MONSTER_CELLS_PER_TILE } from "#/world/core/monster-motion-rules"
import type { EcologySite } from "#/scripts/lib/ecology-zone-schema"
type Props = { site: EcologySite; map: MapDefinition }
/** Inherited blocked cells stay explicit; proposed wet ground is not silently treated as an existing pond. */
export function getEcologyGridErrors(props: Props): string[] {
  const grid = props.site.grid,
    scale = MONSTER_CELLS_PER_TILE,
    width = grid.rows[0].length,
    errors: string[] = []
  if (grid.cell_tiles !== 1 / scale || grid.rows.some((row) => row.length !== width) || !grid.origin_tiles.every((value) => Number.isInteger(value * scale)))
    return ["Ecology grid does not align with the walk grid"]
  if (grid.origin_tiles.some((value) => value < 0) || grid.origin_tiles[0] * scale + width > props.map.size || grid.origin_tiles[1] * scale + grid.rows.length > props.map.size)
    return ["Ecology grid leaves its map"]

  const symbols = new Set(props.site.features.map((feature) => feature.symbol))
  for (const z of grid.rows.keys())
    for (const x of [...grid.rows[z]].keys()) {
      const symbol = grid.rows[z][x]
      if (symbol !== "." && symbol !== "#" && !symbols.has(symbol)) errors.push(`Ecology grid has an unknown symbol ${symbol}`)
      const isFree = walkable(props.map, [grid.origin_tiles[0] * scale + x, grid.origin_tiles[1] * scale + z])
      if ((symbol === "#") === isFree) errors.push(`Ecology grid disagrees with existing ground at ${x},${z}`)
    }
  return errors
}
