import { SpatialFrame } from "#/lib/engine/spatial-frame"
import { TILE_M } from "#/world/town/fit"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

/** Validate a known site's physical frame; an absent site remains unverified, never inferred. */
export function assertAuthoredSiteFrame(source: AuthoredPlan): void {
  const site = source.exterior
  if (!site) return
  if (site.id !== source.id || !site.bounds.every(Number.isFinite)) throw new Error(`Invalid authored site frame: ${source.id}`)
  const width = (site.bounds[2] - site.bounds[0]) * TILE_M,
    depth = (site.bounds[3] - site.bounds[1]) * TILE_M
  if (![width, depth].every((value) => Number.isFinite(value) && value > 0)) throw new Error(`Invalid authored site frame: ${source.id}`)
  try {
    const frame = new SpatialFrame({
      origin: [site.bounds[0] * TILE_M, site.floorY * TILE_M, site.bounds[1] * TILE_M],
      width: source.width * source.cellM,
      depth: source.depth * source.cellM,
      quarterTurns: site.quarterTurns,
    })
    if (Math.abs(frame.size[0] - width) > 1e-6 || Math.abs(frame.size[1] - depth) > 1e-6) throw new Error(`Authored exterior dimensions disagree: ${source.id}`)
  } catch (error) {
    if (error instanceof RangeError) throw new Error(`Invalid authored site frame: ${source.id}`, { cause: error })
    throw error
  }
}
