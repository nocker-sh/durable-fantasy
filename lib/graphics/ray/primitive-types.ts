import type { PrimitiveBounds } from "#/lib/graphics/ray/primitive-bounds-types"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import type { BoundedField } from "#/lib/engine/field-separation"

/** Shade source: which ramp and a brightness offset at a surface point. */
/** ramp, brightness offset, optional hatch: +1 highlight strokes, -1 shadow strokes */
export type SurfaceMaterial = (p: V3, n: V3, l: V3) => [string, number] | [string, number, number]

export type Primitive = {
  bounds?: PrimitiveBounds
  boxBounds?: () => readonly PrimitiveBounds[] | undefined
  capsuleBounds?: () => readonly { a: V3; b: V3; r: number }[]
  separationFields?: () => readonly BoundedField[] | undefined
  kind: "sph" | "cap" | "cone" | "sdf"
  sdLipschitz?: number // certified global bound for the optional signed field
  sd?: (p: V3) => number // sdf: signed distance, bounded by sphere (a, r)
  a: V3
  b: V3
  r: number
  r2: number // sph: a=centre, r; cap: a,b,r; cone: a(base)->b(top), r(base), r2(top)
  sx?: number
  sy?: number
  sz?: number // sphere scale (ellipsoid, axis aligned in local frame)
  m: SurfaceMaterial
  id: number
  clip?: (p: V3) => boolean // keep hit?
  flat?: number // 0..1 how much the light direction shades it (default 0.45)
  ln?: boolean // draw separation lines against other `ln` parts of the same ramp (hair locks)
  grp?: number // parts of one hair lock share a group: lines go only between groups
}

export type PrimitiveShape = Omit<Primitive, "id" | "m">
