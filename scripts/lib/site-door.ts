import { siteTransform } from "./site-transform"
type DoorSite = {
  grid: { rows: string[]; cell_m: number }
  room_origin: number[]
  door: number[]
  span: number
  site_origin: number[]
  width_m: number
  depth_m: number
  rotation_quarters: number
  metres_per_tile: number
}
/** One conversion for a room's boundary door and the outdoor site that contains it. */
export function siteDoorPose(input: DoorSite) {
  const gridSource = input,
    grid = gridSource.grid,
    origin = gridSource.room_origin,
    nestedValue = gridSource.door,
    x = nestedValue[0],
    z = nestedValue[1],
    span = gridSource.span,
    site = gridSource.site_origin,
    width_m = gridSource.width_m,
    depth_m = gridSource.depth_m,
    rotation = gridSource.rotation_quarters,
    metres = gridSource.metres_per_tile
  const rows = grid.rows,
    horizontal = z === 0 || z === rows.length - 1
  if (!rows.length || ![x, z, span].every(Number.isSafeInteger) || span < 1 || ![0, 1, 2, 3].includes(rotation) || ![metres, grid.cell_m, width_m, depth_m].every((n) => Number.isFinite(n) && n > 0))
    return undefined
  if (!horizontal && x !== 0 && x !== rows[0].length - 1) return undefined
  for (let k = 0; k < span; k++) if (rows[z + (horizontal ? 0 : k)]?.[x + (horizontal ? k : 0)] !== "D") return undefined
  const scale = grid.cell_m / metres,
    east = x === rows[0].length - 1,
    south = z === rows.length - 1
  const localX = (origin[0] + x + (horizontal ? span / 2 : east ? 1 : 0)) * scale
  const localZ = (origin[1] + z + (horizontal ? (south ? 1 : 0) : span / 2)) * scale
  const transform = siteTransform(width_m / metres, depth_m / metres, rotation),
    offset = transform.point(localX, localZ)
  return {
    point: [site[0] + offset[0], site[1] + offset[1]],
    outward: transform.direction(horizontal ? 0 : east ? 1 : -1, horizontal ? (south ? 1 : -1) : 0),
    width_m: span * grid.cell_m,
    bounds: [site[0], site[1], site[0] + transform.size[0], site[1] + transform.size[1]] as [number, number, number, number],
  }
}
