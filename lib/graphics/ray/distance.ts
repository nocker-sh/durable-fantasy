import { qrot, type Q } from "../../engine/quaternion.ts"
import { type V3, sub, dot, lerp3, norm, add, mul } from "./vector.ts"

// One limb as a single surface: tapered round cones joined at shared joint spheres, so
// shoulder, elbow, wrist and hand (or hip, knee, ankle) flow without knobs or seams.
function limbSd(pts: V3[], rs: number[]) {
  const G = pts.slice(0, -1).map((a, i) => {
    const b = pts[i + 1],
      ba = sub(b, a),
      l2 = Math.max(1e-8, dot(ba, ba)),
      rr = rs[i] - rs[i + 1]
    return { a, ba, l2, rr, a2: l2 - rr * rr, il2: 1 / l2, r1: rs[i], r2: rs[i + 1] }
  })
  // round cone (iq)
  const rc = (p: V3, g: (typeof G)[number]) => {
    const pa0 = p[0] - g.a[0],
      pa1 = p[1] - g.a[1],
      pa2 = p[2] - g.a[2]
    const y = pa0 * g.ba[0] + pa1 * g.ba[1] + pa2 * g.ba[2],
      z = y - g.l2
    const qx = pa0 * g.l2 - g.ba[0] * y,
      qy = pa1 * g.l2 - g.ba[1] * y,
      qz = pa2 * g.l2 - g.ba[2] * y
    const x2 = qx * qx + qy * qy + qz * qz,
      y2 = y * y * g.l2,
      z2 = z * z * g.l2
    const k = Math.sign(g.rr) * g.rr * g.rr * x2
    if (Math.sign(z) * g.a2 * z2 > k) return Math.sqrt(x2 + z2) * g.il2 - g.r2
    if (Math.sign(y) * g.a2 * y2 < k) return Math.sqrt(x2 + y2) * g.il2 - g.r1
    return (Math.sqrt(x2 * g.a2 * g.il2) + y * g.rr) * g.il2 - g.r1
  }
  const sd = (p: V3, hit?: { i: number }) => {
    let d = 1e9
    for (let i = 0; i < G.length; i++) {
      const di = rc(p, G[i])
      if (di < d) {
        d = di
        if (hit) hit.i = i
      }
    }
    return d
  }
  const c = lerp3(pts[0], pts[pts.length - 1], 0.5)
  const r = Math.max(...pts.map((q, i) => Math.hypot(...sub(q, c)) + rs[i])) + 0.01
  return { sd, c, r }
}

// An SDF given in its own frame (X, Y, Z unit axes at c), bounded by a sphere of radius r
function frameSd(c: V3, X: V3, Y: V3, Z: V3, f: (x: number, y: number, z: number) => number, r: number) {
  const sd = (p: V3) => {
    const o = sub(p, c)
    return f(dot(o, X), dot(o, Y), dot(o, Z))
  }
  const loc = (p: V3): V3 => {
    const o = sub(p, c)
    return [dot(o, X), dot(o, Y), dot(o, Z)]
  }
  return { sd, loc, c, r }
}

// Cross-section rings joined by straight sides (a loft, like the papercraft villagers in
// a faceted silhouette). Each ring is an ellipse w x d in its bone's frame.
type Ring = { c: V3; q: Q; w: number; d: number }

function loftSd(rings: Ring[]) {
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
    let best = 1e9
    for (let i = 0; i < segs.length; i++) {
      const r = segSd(p, segs[i])
      if (r.d < best) {
        best = r.d
        if (hit) {
          hit.i = i
          hit.t = r.t
        }
      }
    }
    return best * 0.8
  }
  const c = lerp3(rings[0].c, rings[rings.length - 1].c, 0.5)
  const r = Math.max(...rings.map((q) => Math.hypot(...sub(q.c, c)) + Math.max(q.w, q.d))) + 0.02
  return { sd, c, r }
}

export { limbSd, frameSd, type Ring, loftSd }
