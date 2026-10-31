import { Polyline } from "#/lib/engine/polyline"
import type { Road } from "#/world/maps/layout-types"
import type { RoadPath } from "#/world/maps/ground/types"

/** Snapshot each road centreline while retaining the renderer's material codes and widths. */
export function getGroundRoadPaths(roads: readonly Road[]): RoadPath[] {
  return roads.map((road) => ({ path: new Polyline(road.pts), width: road.w, kind: road.kind === "cobble" ? 1 : road.kind === "dirt" ? 2 : 3 }))
}
