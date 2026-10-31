import { projectSiteDoorPose } from "#/scripts/lib/project-site-door-pose"
import type { SiteDoorPose } from "#/scripts/lib/site-door-pose-types"
import { getGridBoundaryOpening } from "#/scripts/lib/get-grid-boundary-opening"
import { SpatialFrame } from "#/lib/engine/spatial-frame"

type Props = {
  grid: { rows: readonly string[]; cell_m: number }
  room_origin: readonly number[]
  door: readonly number[]
  span: number
  site_origin: readonly number[]
  width_m: number
  depth_m: number
  rotation_quarters: number
  metres_per_tile: number
}

/** A boundary doorway and its exterior site use the same frame and unit conversion. */
export function getSiteDoorPose(props: Props): SiteDoorPose | undefined {
  const opening = getGridBoundaryOpening({ rows: props.grid.rows, door: props.door, span: props.span })
  if (!opening || ![0, 1, 2, 3].includes(props.rotation_quarters)) return undefined
  if (![props.metres_per_tile, props.grid.cell_m, props.width_m, props.depth_m].every((value) => Number.isFinite(value) && value > 0)) return undefined
  if (props.room_origin.length !== 2 || props.site_origin.length !== 2 || ![...props.room_origin, ...props.site_origin].every(Number.isFinite)) return undefined
  const openingWidth = props.span * props.grid.cell_m
  if (!Number.isFinite(openingWidth)) return undefined
  const width = props.width_m / props.metres_per_tile
  const depth = props.depth_m / props.metres_per_tile
  if (![width, depth].every(Number.isFinite) || width <= 0 || depth <= 0) return undefined
  const scale = props.grid.cell_m / props.metres_per_tile
  const localX = (props.room_origin[0] + opening.cell[0] + opening.offset[0]) * scale
  const localZ = (props.room_origin[1] + opening.cell[1] + opening.offset[1]) * scale
  try {
    const frame = new SpatialFrame({ origin: [props.site_origin[0], 0, props.site_origin[1]], width, depth, quarterTurns: props.rotation_quarters })
    return projectSiteDoorPose({ frame, opening, local: [localX, 0, localZ], siteOrigin: props.site_origin, openingWidth })
  } catch (error) {
    if (error instanceof RangeError) return undefined
    throw error
  }
}
