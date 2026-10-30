import type { Vector2Tuple } from "#/lib/engine/vector2-types"

/** Snapshot planar segments for repeated distance queries. */
export class Polyline {
  readonly #segments: ReadonlyArray<Readonly<{ ax: number; az: number; dx: number; dz: number; l2: number }>>

  /** Snapshot a path for repeated queries; later edits to its points do not alter it. */
  constructor(pts: readonly Vector2Tuple[]) {
    this.#segments = pts.slice(0, -1).map((entry, i) => {
      const ax = entry[0]
      const az = entry[1]

      const dx = pts[i + 1][0] - ax
      const dz = pts[i + 1][1] - az
      return Object.freeze({ ax, az, dx, dz, l2: dx * dx + dz * dz || 1e-9 })
    })
    Object.freeze(this)
  }

  distance(px: number, pz: number): number {
    const closestSquared = this.#segments.reduce((best, segment) => {
      const projection = ((px - segment.ax) * segment.dx + (pz - segment.az) * segment.dz) / segment.l2
      const fraction = projection < 0 ? 0 : projection > 1 ? 1 : projection
      const x = segment.ax + segment.dx * fraction - px
      const z = segment.az + segment.dz * fraction - pz
      const squared = x * x + z * z
      return squared < best ? squared : best
    }, 1e9)
    return Math.sqrt(closestSquared)
  }

  static distance(px: number, pz: number, pts: Vector2Tuple[]): number {
    return new Polyline(pts).distance(px, pz)
  }
}
