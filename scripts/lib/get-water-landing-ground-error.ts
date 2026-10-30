import { getGridRectangleClearanceError } from "#/lib/engine/get-grid-rectangle-clearance-error"
import { WELL_BLOCK_RADIUS_TILES } from "#/world/town/well-dimensions"
import type { WaterLanding } from "#/scripts/lib/water-landing-schema"
import type { MapDefinition } from "#/world/maps/types"
type Props = { landing: WaterLanding; map: MapDefinition; anchorTiles: readonly [number, number]; metresPerTile: number }

/** Keep the entire receiving floor off native solid cells and outside the unchanged well collision circle. */
export function getWaterLandingGroundError(props: Props): Error | null {
  const landing = props.landing,
    scale = props.metresPerTile
  if (![...props.anchorTiles, scale].every(Number.isFinite) || scale <= 0) return new Error("Invalid water landing map transform")
  const relative: [number, number, number, number] = [
    landing.origin_m[0],
    landing.origin_m[1],
    landing.origin_m[0] + landing.rows[0].length * landing.cell_m,
    landing.origin_m[1] + landing.rows.length * landing.cell_m,
  ]
  if (Math.hypot(Math.max(relative[0], -relative[2], 0), Math.max(relative[1], -relative[3], 0)) < WELL_BLOCK_RADIUS_TILES * scale) return new Error("Water landing overlaps the native well")
  const rect: [number, number, number, number] = [
    relative[0] + props.anchorTiles[0] * scale,
    relative[1] + props.anchorTiles[1] * scale,
    relative[2] + props.anchorTiles[0] * scale,
    relative[3] + props.anchorTiles[1] * scale,
  ]

  return getGridRectangleClearanceError({ rect, cellSize: scale / 2, isCellFree: (cell) => props.map.rows[cell[1]]?.[cell[0]] === "." })
}
