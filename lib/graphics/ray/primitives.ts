import type { V3 } from "./vector.ts"

/** Shade source: which ramp and a brightness offset at a surface point. */
/** ramp, brightness offset, optional hatch: +1 highlight strokes, -1 shadow strokes */
type SurfaceMaterial = (p: V3, n: V3, l: V3) => [string, number] | [string, number, number]

const solid =
  (ramp: string, off = 0): SurfaceMaterial =>
  () => [ramp, off]

const hash01 = (p: V3) => {
  const h = Math.sin(p[0] * 127.1 + p[1] * 311.7 + p[2] * 74.7) * 43758.5453
  return h - Math.floor(h)
}

interface Primitive {
  kind: "sph" | "cap" | "cone" | "sdf"
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
  F?: { u: V3; v: V3; w: V3; h: number }
}

export { type SurfaceMaterial, solid, hash01, type Primitive }
