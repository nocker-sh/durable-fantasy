import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
export type Cuboid = Rectangle & { bottom: number; top: number }
/** Disjoint solid boxes left after removing the union of the voids. */
export function subtractCuboids(source: Cuboid, cuts: readonly Cuboid[]): Cuboid[] {
  return cuts.reduce<Cuboid[]>(
    (parts, cut) =>
      parts.flatMap((r) => {
        const x0 = Math.max(r.x0, cut.x0),
          x1 = Math.min(r.x1, cut.x1),
          z0 = Math.max(r.z0, cut.z0),
          z1 = Math.min(r.z1, cut.z1),
          bottom = Math.max(r.bottom, cut.bottom),
          top = Math.min(r.top, cut.top)
        if (x0 >= x1 || z0 >= z1 || bottom >= top) return [r]
        return [
          { ...r, x1: x0 },
          { ...r, x0: x1 },
          { ...r, x0, x1, z1: z0 },
          { ...r, x0, x1, z0: z1 },
          { x0, x1, z0, z1, bottom: r.bottom, top: bottom },
          { x0, x1, z0, z1, bottom: top, top: r.top },
        ].filter((p) => p.x0 < p.x1 && p.z0 < p.z1 && p.bottom < p.top)
      }),
    [source],
  )
}
