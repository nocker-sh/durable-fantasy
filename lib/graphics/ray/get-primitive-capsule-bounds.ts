import type { PrimitiveShape } from "#/lib/graphics/ray/primitive-types"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
type Capsule = { readonly a: Readonly<V3>; readonly b: Readonly<V3>; readonly r: number }

/** The renderer clips SDF rays to its enclosing sphere; use that tighter envelope before its box corners. */
export function getPrimitiveCapsuleBounds(primitive: PrimitiveShape): readonly Capsule[] {
  const capsules = primitive.capsuleBounds?.()
  if (capsules?.length) return capsules
  if (primitive.kind === "cap" || primitive.kind === "cone") return [{ a: primitive.a, b: primitive.b, r: Math.max(primitive.r, primitive.r2) }]
  if (primitive.kind === "sdf") return [{ a: primitive.a, b: primitive.a, r: primitive.r }]
  const radius = primitive.r * Math.max(primitive.sx ?? 1, primitive.sy ?? 1, primitive.sz ?? 1)

  return [{ a: primitive.a, b: primitive.a, r: radius }]
}
