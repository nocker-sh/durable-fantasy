export type Rectangle = { x0: number; z0: number; x1: number; z1: number }
/** Disjoint rectangles covering the source except its intersections with the cuts. */
export function subtractRectangles(source: Rectangle, cuts: readonly Rectangle[]): Rectangle[] {
  return cuts.reduce<Rectangle[]>(
    (parts, cut) =>
      parts.flatMap((r) => {
        const x0 = Math.max(r.x0, cut.x0),
          z0 = Math.max(r.z0, cut.z0),
          x1 = Math.min(r.x1, cut.x1),
          z1 = Math.min(r.z1, cut.z1)
        if (x0 >= x1 || z0 >= z1) return [r]
        return [
          { x0: r.x0, z0: r.z0, x1: r.x1, z1: z0 },
          { x0: r.x0, z0: z1, x1: r.x1, z1: r.z1 },
          { x0: r.x0, z0, x1: x0, z1 },
          { x0: x1, z0, x1: r.x1, z1 },
        ].filter((p) => p.x1 > p.x0 && p.z1 > p.z0)
      }),
    [source],
  )
}
