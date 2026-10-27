export type V2 = [number, number]

/** Curve and distance operations on planar polylines. */
export class Polyline {
  private readonly segments: { ax: number; az: number; dx: number; dz: number; l2: number }[]

  /** Snapshot a path for repeated queries; later edits to its points do not alter it. */
  constructor(pts: readonly V2[]) {
    this.segments = pts.slice(0, -1).map(([ax, az], i) => {
      const dx = pts[i + 1][0] - ax
      const dz = pts[i + 1][1] - az
      return { ax, az, dx, dz, l2: dx * dx + dz * dz || 1e-9 }
    })
  }

  distance(px: number, pz: number): number {
    let best = 1e9
    for (const { ax, az, dx, dz, l2 } of this.segments) {
      let t = ((px - ax) * dx + (pz - az) * dz) / l2
      t = t < 0 ? 0 : t > 1 ? 1 : t
      const ex = ax + dx * t - px
      const ez = az + dz * t - pz
      const d = ex * ex + ez * ez
      if (d < best) best = d
    }
    return Math.sqrt(best)
  }

  static catmull(pts: V2[], k = 8): V2[] {
    const out: V2[] = []
    const p = [pts[0], ...pts, pts[pts.length - 1]]
    for (let i = 1; i < p.length - 2; i++) {
      const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]]
      for (let j = 0; j < k; j++) {
        const t = j / k,
          t2 = t * t,
          t3 = t2 * t
        const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
      }
    }
    out.push(pts[pts.length - 1])
    return out
  }

  static distance(px: number, pz: number, pts: V2[]): number {
    let best = 1e9
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i],
        [bx, bz] = pts[i + 1]
      const dx = bx - ax,
        dz = bz - az
      const l2 = dx * dx + dz * dz || 1e-9
      let t = ((px - ax) * dx + (pz - az) * dz) / l2
      t = t < 0 ? 0 : t > 1 ? 1 : t
      const ex = ax + dx * t - px,
        ez = az + dz * t - pz
      const d = ex * ex + ez * ez
      if (d < best) best = d
    }
    return Math.sqrt(best)
  }
}
