import { fbm } from "#/lib/engine/fbm"
import { vnoise } from "#/lib/engine/vnoise"
import type { RoadPath } from "#/world/scene/world"

type Props = Readonly<{ seed: number; roads: readonly RoadPath[] }>
type Sample = { distance: number; kind: number }

/** Warped centrelines, swelling width and ragged edges share the winning road's material; ties retain the first road. */
export function getRoadFieldSample(x: number, z: number, context: Props): Readonly<Sample> {
  const nearest: Sample = { distance: 1e9, kind: 0 }
  if (context.roads.length === 0) return nearest

  const seed = context.seed
  const wx = (vnoise({ x, y: z, scale: 0.14, seed: seed + 401 }) - 0.5) * 0.9
  const wz = (vnoise({ x, y: z, scale: 0.14, seed: seed + 402 }) - 0.5) * 0.9
  const swell = 1 + (fbm({ x, y: z, scale: 0.2, seed: seed + 403 }) - 0.5) * 0.5
  const ragged = (vnoise({ x, y: z, scale: 1.7, seed: seed + 404 }) - 0.5) * 0.16
  for (const road of context.roads) {
    const distance = road.path.distance(x + wx, z + wz) - road.width * swell + ragged
    if (distance < nearest.distance) {
      nearest.distance = distance
      nearest.kind = road.kind
    }
  }
  return nearest
}
