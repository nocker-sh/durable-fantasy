import { getLoftSeparationFields } from "#/lib/graphics/ray/get-loft-separation-fields"
import type { PrimitiveBounds } from "#/lib/graphics/ray/primitive-bounds-types"
import { qrot } from "#/lib/engine/qrot"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { crossVector3 as cross } from "#/lib/engine/cross-vector3"
import type { Ring } from "#/lib/graphics/ray/distance-types"

export function loftSd(source: readonly Ring[]) {
  const rings = source.map((ring): Ring => ({ ...ring, c: [...ring.c], q: [...ring.q] }))
  const segs = rings.slice(0, -1).map((A, i) => {
    const B = rings[i + 1]
    const ax = sub(B.c, A.c),
      l2 = dot(ax, ax) || 1e-6
    const xa = qrot(A.q, [1, 0, 0]),
      xb = qrot(B.q, [1, 0, 0]),
      za = qrot(A.q, [0, 0, 1]),
      zb = qrot(B.q, [0, 0, 1])
    return { A, B, ax, l2, X: norm(add(xa, xb)), Z: norm(add(za, zb)) }
  })
  const segSd = (p: V3, g: (typeof segs)[number]) => {
    const pa = sub(p, g.A.c)
    const t0 = dot(pa, g.ax) / g.l2,
      t = Math.min(1, Math.max(0, t0))
    const o = sub(pa, mul(g.ax, t))
    const w = g.A.w + (g.B.w - g.A.w) * t,
      d = g.A.d + (g.B.d - g.A.d) * t
    const ex = dot(o, g.X) / w,
      ez = dot(o, g.Z) / d
    const radial = (Math.sqrt(ex * ex + ez * ez) - 1) * Math.min(w, d)
    const axial = (Math.abs(t0 - 0.5) - 0.5) * Math.sqrt(g.l2)
    return { d: Math.max(radial, axial), t }
  }
  const sd = (p: V3, hit?: { i: number; t: number }) => {
    const best = { value: 1e9 }
    for (const i = { value: 0 }; i.value < segs.length; i.value++) {
      const r = segSd(p, segs[i.value])
      if (r.d < best.value) {
        best.value = r.d
        if (hit) {
          hit.i = i.value
          hit.t = r.t
        }
      }
    }
    return best.value * 0.8
  }
  const c = lerp3(rings[0].c, rings[rings.length - 1].c, 0.5)
  const r = Math.max(...rings.map((q) => Math.hypot(...sub(q.c, c)) + Math.max(q.w, q.d))) + 0.02
  const segmentBounds = (g: (typeof segs)[number]): PrimitiveBounds | undefined => {
    const u = cross(g.Z, g.ax),
      v = cross(g.ax, g.X),
      du = dot(g.X, u),
      dv = dot(g.Z, v)
    if (Math.abs(du) < 1e-12 || Math.abs(dv) < 1e-12) return undefined
    const box: PrimitiveBounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
    for (const ring of [g.A, g.B])
      for (const i = { value: 0 }; i.value < 3; i.value++) {
        const extent = Math.hypot((u[i.value] / du) * ring.w, (v[i.value] / dv) * ring.d)
        box.min[i.value] = Math.min(box.min[i.value], ring.c[i.value] - extent)
        box.max[i.value] = Math.max(box.max[i.value], ring.c[i.value] + extent)
      }
    return box
  }
  const boxBounds = () => {
    const boxes = segs.map(segmentBounds)
    return boxes.every((b) => b !== undefined) ? boxes : undefined
  }
  const boxes = boxBounds(),
    bounds: PrimitiveBounds | undefined = boxes
      ? {
          min: [Math.min(...boxes.map((box) => box.min[0])), Math.min(...boxes.map((box) => box.min[1])), Math.min(...boxes.map((box) => box.min[2]))],
          max: [Math.max(...boxes.map((box) => box.max[0])), Math.max(...boxes.map((box) => box.max[1])), Math.max(...boxes.map((box) => box.max[2]))],
        }
      : undefined
  const separationFields = getLoftSeparationFields(
    segs.map((g, index) => ({ from: g.A, to: g.B, axis: g.ax, x: g.X, z: g.Z, lengthSquared: g.l2, bounds: boxes?.[index] ?? null, value: (point) => segSd(point, g).d })),
  )
  return { sd, c, r, bounds, boxBounds, separationFields: () => separationFields }
}
