import type { TriangleProps, QuadProps, BoxProps, CylinderProps, GeometryGroupSnapshot } from "#/lib/graphics/geometry-builder-types"
import * as THREE from "three"

type V3 = readonly [number, number, number]
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const len = (a: V3) => Math.hypot(a[0], a[1], a[2])

type Group = {
  pos: number[]
  uv: number[]
}

/** Accumulates flat-shaded triangles per material, then emits merged meshes. */
export class GeometryBuilder {
  readonly #groups = new Map<THREE.Material, Group>()

  constructor() {
    Object.freeze(this)
  }

  /** A detached view for inspecting pending triangles without mutating the accumulator. */
  get groups(): ReadonlyMap<THREE.Material, GeometryGroupSnapshot> {
    return new Map(Array.from(this.#groups, (entry) => [entry[0], Object.freeze({ pos: Object.freeze([...entry[1].pos]), uv: Object.freeze([...entry[1].uv]) })]))
  }

  private getGroup(material: THREE.Material): Group {
    const known = this.#groups.get(material)
    if (known) return known
    const group = { pos: [], uv: [] }
    this.#groups.set(material, group)
    return group
  }
  tri(props: TriangleProps) {
    const m = props.material
    const a = props.a
    const b = props.b
    const c = props.c
    const ua = props.uvA
    const ub = props.uvB
    const uc = props.uvC

    const g = this.getGroup(m)
    g.pos.push(...a, ...b, ...c)
    g.uv.push(...ua, ...ub, ...uc)
  }
  /** a..d counter-clockwise seen from the front: bottom-left, bottom-right, top-right, top-left.
   *  ru/rv: world units per texture repeat; ru=0 means fit 0..1. */
  quad(props: QuadProps) {
    const m = props.material
    const a = props.a
    const b = props.b
    const c = props.c
    const d = props.d
    const ru = props.repeatU === undefined ? 0 : props.repeatU
    const rv = props.repeatV === undefined ? 0 : props.repeatV
    const u0 = props.offsetU === undefined ? 0 : props.offsetU
    const v0 = props.offsetV === undefined ? 0 : props.offsetV

    const w = len(sub(b, a)),
      h = len(sub(d, a))
    const U = ru ? w / ru : 1,
      V = rv ? h / rv : 1
    this.tri({ material: m, a: a, b: b, c: c, uvA: [u0, v0], uvB: [u0 + U, v0], uvC: [u0 + U, v0 + V] })
    this.tri({ material: m, a: a, b: c, c: d, uvA: [u0, v0], uvB: [u0 + U, v0 + V], uvC: [u0, v0 + V] })
  }
  box(props: BoxProps) {
    const side = props.side
    const top = props.top
    const x0 = props.x0
    const y0 = props.y0
    const z0 = props.z0
    const x1 = props.x1
    const y1 = props.y1
    const z1 = props.z1
    const r = props.repeat === undefined ? 2 : props.repeat
    const bottom = props.bottom === undefined ? false : props.bottom

    const p = (x: number, y: number, z: number): V3 => [x, y, z]
    this.quad({ material: side, a: p(x0, y0, z1), b: p(x1, y0, z1), c: p(x1, y1, z1), d: p(x0, y1, z1), repeatU: r, repeatV: r, offsetU: x0 / r, offsetV: y0 / r }) // +z
    this.quad({ material: side, a: p(x1, y0, z0), b: p(x0, y0, z0), c: p(x0, y1, z0), d: p(x1, y1, z0), repeatU: r, repeatV: r, offsetU: -x1 / r, offsetV: y0 / r }) // -z
    this.quad({ material: side, a: p(x1, y0, z1), b: p(x1, y0, z0), c: p(x1, y1, z0), d: p(x1, y1, z1), repeatU: r, repeatV: r, offsetU: -z1 / r, offsetV: y0 / r }) // +x
    this.quad({ material: side, a: p(x0, y0, z0), b: p(x0, y0, z1), c: p(x0, y1, z1), d: p(x0, y1, z0), repeatU: r, repeatV: r, offsetU: z0 / r, offsetV: y0 / r }) // -x
    if (top) this.quad({ material: top, a: p(x0, y1, z1), b: p(x1, y1, z1), c: p(x1, y1, z0), d: p(x0, y1, z0), repeatU: r, repeatV: r, offsetU: x0 / r, offsetV: -z1 / r })
    if (bottom) this.quad({ material: top ?? side, a: p(x0, y0, z0), b: p(x1, y0, z0), c: p(x1, y0, z1), d: p(x0, y0, z1), repeatU: r, repeatV: r })
  }
  cyl(props: CylinderProps) {
    const side = props.side
    const top = props.top
    const cx = props.centerX
    const cz = props.centerZ
    const y0 = props.fromY
    const y1 = props.toY
    const r0 = props.fromRadius
    const r1 = props.toRadius === undefined ? r0 : props.toRadius
    const seg = props.segments === undefined ? 10 : props.segments
    const ru = props.repeat === undefined ? 2 : props.repeat

    const circ = 2 * Math.PI * Math.max(r0, r1)
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2,
        a1 = ((i + 1) / seg) * Math.PI * 2
      const P = (a: number, y: number, r: number): V3 => [cx + Math.cos(a) * r, y, cz - Math.sin(a) * r]
      const u0 = ((i / seg) * circ) / ru,
        u1 = (((i + 1) / seg) * circ) / ru
      const v = (y1 - y0) / ru
      this.tri({ material: side, a: P(a0, y0, r0), b: P(a1, y0, r0), c: P(a1, y1, r1), uvA: [u0, 0], uvB: [u1, 0], uvC: [u1, v] })
      this.tri({ material: side, a: P(a0, y0, r0), b: P(a1, y1, r1), c: P(a0, y1, r1), uvA: [u0, 0], uvB: [u1, v], uvC: [u0, v] })
      if (top && r1 > 0) {
        const c: V3 = [cx, y1, cz]
        const t0 = P(a0, y1, r1),
          t1 = P(a1, y1, r1)
        this.tri({ material: top, a: c, b: t0, c: t1, uvA: [0.5, 0.5], uvB: [0.5 + Math.cos(a0) * 0.5, 0.5 + Math.sin(a0) * 0.5], uvC: [0.5 + Math.cos(a1) * 0.5, 0.5 + Math.sin(a1) * 0.5] })
      }
    }
  }
  build(shadows = true): THREE.Group {
    const out = new THREE.Group()
    for (const entry of this.#groups) {
      const m = entry[0]
      const g = entry[1]

      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.Float32BufferAttribute(g.pos, 3))
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(g.uv, 2))
      geo.computeVertexNormals()
      const mesh = new THREE.Mesh(geo, m)
      mesh.castShadow = shadows
      mesh.receiveShadow = true
      out.add(mesh)
    }
    this.#groups.clear()
    return out
  }
}
