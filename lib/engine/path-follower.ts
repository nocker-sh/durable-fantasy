import type { V2 } from "#/lib/engine/pathfinder"

/** Consumes a distance budget across waypoints, independent of render frequency. */
export class PathFollower {
  constructor(private readonly speed: number) {}

  advance(state: { pos: V2; path: V2[] }, seconds: number): number | null {
    if (!Number.isFinite(seconds) || seconds <= 0) return null
    let remaining = this.speed * seconds
    let consumed = 0
    let heading: number | null = null
    for (const point of state.path) {
      const dx = point[0] - state.pos[0]
      const dz = point[1] - state.pos[1]
      const distance = Math.hypot(dx, dz)
      if (distance === 0) {
        consumed++
        continue
      }
      if (remaining <= 0) break
      heading = Math.atan2(dx, dz)
      if (distance > remaining) {
        state.pos[0] += (dx / distance) * remaining
        state.pos[1] += (dz / distance) * remaining
        break
      }
      state.pos[0] = point[0]
      state.pos[1] = point[1]
      remaining -= distance
      consumed++
    }
    if (consumed) state.path.splice(0, consumed)
    return heading
  }
}
