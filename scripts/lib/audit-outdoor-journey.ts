import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
type Rect = readonly [number, number, number, number]
export type JourneyGround = {
  map_tiles: number
  metres_per_tile: number
  water: { points: readonly (readonly number[])[]; half_width: number }
  bridges: readonly Rect[]
  obstacles: readonly { id: string; rect: Rect }[]
}
/** Remove only the supported deck rectangle, never the rest of a river crossing. */
function outside(rect: Rect, support: Rect): Rect[] {
  const x0 = Math.max(rect[0], support[0]),
    y0 = Math.max(rect[1], support[1]),
    x1 = Math.min(rect[2], support[2]),
    y1 = Math.min(rect[3], support[3])
  if (x0 >= x1 || y0 >= y1) return [rect]
  const pieces: Rect[] = [
    [rect[0], rect[1], x0, rect[3]],
    [x1, rect[1], rect[2], rect[3]],
    [x0, rect[1], x1, y0],
    [x0, y1, x1, rect[3]],
  ]
  return pieces.filter((r) => r[0] < r[2] && r[1] < r[3])
}
/** Conservative square body envelope; every turn and every part outside a bridge is checked. */
type Props = {
  points: readonly (readonly number[])[]
  widthMetres: number
  ground: JourneyGround
  sourceId?: string
}
export function auditOutdoorJourney(props: Props): string[] {
  const points = props.points
  const widthMetres = props.widthMetres
  const ground = props.ground
  const sourceId = props.sourceId

  if (
    !Number.isFinite(widthMetres) ||
    widthMetres < MIN_PASSAGE_WIDTH_M ||
    !Number.isFinite(ground.metres_per_tile) ||
    ground.metres_per_tile <= 0 ||
    points.length < 2 ||
    points.some((p) => p.length !== 2 || p.some((n) => !Number.isFinite(n)))
  )
    return ["Invalid journey width or points"]
  const validRect = (r: readonly number[]) => r.length === 4 && r.every(Number.isFinite) && r[0] < r[2] && r[1] < r[3]
  if (
    !Number.isFinite(ground.map_tiles) ||
    ground.map_tiles <= 0 ||
    !Number.isFinite(ground.water.half_width) ||
    ground.water.half_width < 0 ||
    ground.water.points.length < 2 ||
    ground.water.points.some((p) => p.length !== 2 || p.some((n) => !Number.isFinite(n))) ||
    ground.bridges.some((r) => !validRect(r)) ||
    ground.obstacles.some((o) => !validRect(o.rect))
  )
    return ["Invalid journey ground geometry"]
  const errors: string[] = [],
    half = widthMetres / ground.metres_per_tile / 2
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i]
    if (Math.abs(a[0] - b[0]) < 1e-9 === Math.abs(a[1] - b[1]) < 1e-9) {
      errors.push("Journey needs nonzero axis-aligned segments")
      continue
    }
    const box: Rect = [Math.min(a[0], b[0]) - half, Math.min(a[1], b[1]) - half, Math.max(a[0], b[0]) + half, Math.max(a[1], b[1]) + half]
    if (box[0] < 0 || box[1] < 0 || box[2] > ground.map_tiles || box[3] > ground.map_tiles) errors.push("Journey leaves its map")
    for (const obstacle of ground.obstacles)
      if (!(i === 1 && obstacle.id === sourceId) && box[0] < obstacle.rect[2] && obstacle.rect[0] < box[2] && box[1] < obstacle.rect[3] && obstacle.rect[1] < box[3])
        errors.push(`Journey crosses ${obstacle.id}`)
    let unsupported: Rect[] = [box]
    for (const bridge of ground.bridges) unsupported = unsupported.flatMap((rect) => outside(rect, bridge))
    if (unsupported.some((rect) => ground.water.points.slice(1).some((p, j) => segmentRectDistance(rect, ground.water.points[j], p) < ground.water.half_width)))
      errors.push("Journey crosses water outside a bridge")
  }
  return [...new Set(errors)]
}
