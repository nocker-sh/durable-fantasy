import type { RoadPath } from "#/world/scene/world"

export function segRoad(x: number, z: number, roads: readonly RoadPath[]): number {
  const best = { value: 1e9 }
  for (const road of roads) best.value = Math.min(best.value, road.path.distance(x, z) - road.width)
  return best.value
}
