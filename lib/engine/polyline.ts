import { catmullCoordinate } from "#/lib/engine/catmull-coordinate"
export type V2 = [number, number]

/** Curve and distance operations on planar polylines. */
export class Polyline {
  readonly #segments: ReadonlyArray<Readonly<{ ax: number; az: number; dx: number; dz: number; l2: number }>>

  /** Snapshot a path for repeated queries; later edits to its points do not alter it. */
  constructor(pts: readonly V2[]) {
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

  static catmull(pts: V2[], k = 8): V2[] {
    const out: V2[] = []
    const p = [pts[0], ...pts, pts[pts.length - 1]]
    for (let i = 1; i < p.length - 2; i++) {
      const p0State = [p[i - 1], p[i], p[i + 1], p[i + 2]],
        p0 = p0State[0],
        p1 = p0State[1],
        p2 = p0State[2],
        p3 = p0State[3]
      for (let j = 0; j < k; j++) {
        const time = j / k
        out.push([catmullCoordinate({ previous: p0[0], start: p1[0], end: p2[0], next: p3[0], time }), catmullCoordinate({ previous: p0[1], start: p1[1], end: p2[1], next: p3[1], time })])
      }
    }
    out.push(pts[pts.length - 1])
    return out
  }

  static distance(px: number, pz: number, pts: V2[]): number {
    return new Polyline(pts).distance(px, pz)
  }
}
