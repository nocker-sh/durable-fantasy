import { subtractRectangles, type Rectangle } from "../../lib/engine/rectangle-subtraction"

/** The duct remains empty through every masonry course. */
export function flueWalls(outer: Rectangle, thickness: number) {
  const width = outer.x1 - outer.x0,
    depth = outer.z1 - outer.z0
  if (!Number.isFinite(thickness) || thickness <= 0 || thickness * 2 >= Math.min(width, depth)) throw new Error("Flue wall thickness leaves no duct")
  const duct = { x0: outer.x0 + thickness, z0: outer.z0 + thickness, x1: outer.x1 - thickness, z1: outer.z1 - thickness }
  return { duct, walls: subtractRectangles(outer, [duct]) }
}
