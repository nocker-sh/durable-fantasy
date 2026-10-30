import type { limbSd } from "#/lib/graphics/ray/limb-sd"
import type { PrimitiveShape } from "./primitive-types"

/** A real uncut rounded-cone union carries its own distance field and capsule envelope without rendering-only identity or material. */
export function getLimbPrimitiveShape(surface: ReturnType<typeof limbSd>): PrimitiveShape {
  return { kind: "sdf", bounds: surface.bounds, capsuleBounds: surface.capsuleBounds, a: surface.c, b: surface.c, r: surface.r, r2: 0, sd: surface.sd, sdLipschitz: 1 }
}
