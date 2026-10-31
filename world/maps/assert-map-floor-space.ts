import { overlap } from "#/world/town/floorplan/overlap"
import type { MapSpace } from "#/world/maps/map-space-types"
import type { Rect } from "#/world/town/floorplan/types"

/** Floor strips must describe disjoint, finite solids inside the same local domain as the rooms. */
export function assertMapFloorSpace(space: MapSpace): void {
  const floor = space.floor
  if (floor === undefined) return
  if (!floor || !Array.isArray(floor.footprint)) throw new Error("Invalid map floor geometry")
  if (!Number.isFinite(floor.thicknessMetres) || floor.thicknessMetres <= 0) throw new Error("Invalid map floor thickness")
  const occupied: Readonly<Rect>[] = []
  for (const strip of floor.footprint) {
    if (
      ![strip.x0, strip.z0, strip.x1, strip.z1].every(Number.isFinite) ||
      strip.x0 < 0 ||
      strip.z0 < 0 ||
      strip.x1 > space.frame.width ||
      strip.z1 > space.frame.depth ||
      strip.x1 <= strip.x0 ||
      strip.z1 <= strip.z0
    )
      throw new Error("Map floor footprint is outside its frame")
    if (occupied.some((previous) => overlap(previous, strip))) throw new Error("Map floor strips overlap")
    occupied.push(strip)
  }
}
