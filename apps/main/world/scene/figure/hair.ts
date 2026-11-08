import type { BodyContext } from "#/world/scene/figure/context"
import type { HeadContext } from "#/world/scene/figure/head"
import { createSolidSurfaceMaterial } from "#/lib/graphics/ray/create-solid-surface-material"
import type { SurfaceMaterial } from "#/lib/graphics/ray/primitive-types"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import { type Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { multiplyMatrix3Vector as mv } from "#/lib/engine/multiply-matrix3-vector"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { type Fringe, FRINGES } from "#/world/scene/figure/look"

function buildHair(context: BodyContext & HeadContext) {
  const LSource = context,
    L = LSource.L,
    hc = LSource.hc,
    M = LSource.M,
    hs = LSource.hs,
    headR = LSource.headR,
    SQ = LSource.SQ,
    push = LSource.push,
    along = LSource.along,
    m0 = LSource.m0,
    m1 = LSource.m1,
    m2 = LSource.m2
  // ---- hair: a snug cap plus tapered locks (bangs, face-framing side locks,
  // a jagged back) so the silhouette reads as anime hair rather than a helmet
  const hairRamp = L.hair
  // the cap underneath is one flat shadow tone; all light lives on the locks
  const strand: SurfaceMaterial = (p, n, l) => [hairRamp, 0.02, dot(n, l) > -0.15 && dot(n, l) < 0.12 ? -1 : 0]
  let lockN = 0
  const H = (v: V3): V3 => add(hc, mv(M, mul(v, hs)))
  const hOff: V3 = [0, 0.02 * hs, -0.014 * hs]
  const sp = (az: number, el: number, rr: number): V3 => [
    (hOff[0] + Math.sin(az) * Math.cos(el) * headR * rr) / hs,
    (hOff[1] + Math.sin(el) * headR * rr * (el > 0 ? SQ : 1)) / hs,
    (hOff[2] + Math.cos(az) * Math.cos(el) * headR * rr) / hs,
  ]
  // quadratic bezier lock in head space, tapering from w at the root to a point
  // wave: sideways S-curve (amplitude in head units, number of half waves)
  const lock = (inputProps: { p0: V3; p1: V3; p2: V3; w: number; segs?: number; tipW?: number; wave?: number; waves?: number }) => {
    const p0 = inputProps.p0
    const p1 = inputProps.p1
    const p2 = inputProps.p2
    const w = inputProps.w
    const segs = inputProps.segs === undefined ? 4 : inputProps.segs
    const tipW = inputProps.tipW === undefined ? 0.004 : inputProps.tipW
    const wave = inputProps.wave === undefined ? 0 : inputProps.wave
    const waves = inputProps.waves === undefined ? 2 : inputProps.waves

    const az0 = Math.atan2(p2[0], p2[2])
    const side: V3 = [Math.cos(az0), 0, -Math.sin(az0)]
    const grp = ++lockN
    const hiAt = 0.22 + ((grp * 0.37) % 1) * 0.22 // stagger highlights lock to lock
    // one smooth surface per lock (round cones through the curve), so its shading is clean
    const pts: V3[] = [H(p0)],
      rs = [w * hs]
    for (let i = 1; i <= segs; i++) {
      const t = i / segs,
        u = 1 - t
      const wv = wave * Math.sin(Math.PI * t * waves) * Math.min(1, t * 3)
      const q: V3 = [
        u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0] + side[0] * wv,
        u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
        u * u * p0[2] + 2 * u * t * p1[2] + t * t * p2[2] + side[2] * wv,
      ]
      pts.push(H(q))
      rs.push((w + (tipW - w) * t ** 0.85) * hs)
    }
    const lk = limbSd(pts, rs)
    push({
      kind: "sdf",
      bounds: lk.bounds,
      capsuleBounds: lk.capsuleBounds,
      a: lk.c,
      b: lk.c,
      r: lk.r,
      r2: 0,
      sd: (p) => lk.sd(p),
      ln: true,
      grp,
      flat: 0.6,
      m: (p, n, l) => {
        const h = { i: 0 }
        lk.sd(p, h)
        const T = (h.i + Math.min(1, Math.max(0, along(p, pts[h.i], pts[h.i + 1])))) / segs
        const lit = dot(n, l)
        const hi = lit > 0.3 && T > hiAt - 0.12 && T < hiAt + 0.2 ? 0.16 : 0
        return [hairRamp, 0.02 + hi - (T > 0.8 ? 0.07 : 0)]
      },
    })
  }
  const covered = L.hat === "hood" || L.hat === "helm" || L.hat === "greathelm"
  // only face-framing locks show // other headwear sits on top of the hair clumps, so side hair still shows
  const st = L.style
  const long = st === "long",
    bob = st === "bob",
    short = st === "short",
    curly = st === "curly"
  const seed = (L.hair.length * 7 + L.top.length * 13 + (L.eye ?? "").length * 3 + st.length) % 17
  const jit = (k: number) => Math.sin(k * 12.9898 + seed * 78.233) * 0.5 + 0.5
  if (st !== "bald") {
    // One continuous hair mass: a shell over the skull cut by a single designed edge
    // curve (the fringe line in front, the hem behind) instead of many overlapping locks.
    const fr: Fringe = L.fringe ?? FRINGES[seed % FRINGES.length]
    const d = seed % 2 ? 1 : -1 // which way a swept fringe falls
    const smooth = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
      return t * t * (3 - 2 * t)
    }
    const spike = (x: number, at: number, w: number) => Math.max(0, 1 - Math.abs(x - at) / w)
    const sideLvl = short ? -0.6 : curly ? -0.6 : bob ? -0.8 : -0.95 // sides always reach the ears
    const FD = fr === "back" || fr === "pompadour" || fr === "devillock" ? 0 : 0.14 // fringes hang down over the brows
    const EYE = (az: number) => 0.2 * spike(Math.abs(az), 0.3, 0.2) // keep a window over each eye
    const front = (az: number): number => Math.max(frontRaw(az) - FD, EYE(az) > 0 ? Math.min(frontRaw(az), 0.02 + EYE(az)) : -9)
    const frontRaw = (az: number): number => {
      if (fr === "swept") {
        // one big diagonal curve: high at the part, sweeping down over one eye to a point at the cheek
        const s2 = d * az
        let e = 0.45 - 0.9 * smooth(-0.6, 0.7, s2) - 0.2 * smooth(0.6, 1.2, s2)
        e -= 0.14 * spike(s2, 0.62, 0.22) + 0.08 * spike(s2, 0.05, 0.14) // two tips break the edge
        return e
      }
      if (fr === "curtain") {
        // centre part: two arcs opening from the parting down to the cheeks
        const u = Math.abs(az)
        return 0.62 - 1.25 * smooth(0.02, 1.0, u) + 0.12 * spike(u, 0, 0.12) - 0.08 * spike(u, 0.55, 0.15)
      }
      const u = Math.abs(az)
      switch (fr) {
        case "blunt":
          return 0.1 + 0.05 * u - 0.05 * spike(u, 0.35, 0.12)
        case "spiky":
          return 0.36 - 0.2 * Math.abs(Math.sin(az * 3.2 + 0.3)) // a few big rounded teeth
        case "zigzag":
          return 0.3 - 0.26 * (1 - Math.abs(((az * 2.6 + 10.5) % 1) * 2 - 1)) // regular sharp teeth to the brow
        case "flicked":
          return 0.16 + 0.06 * u // brow-length; the ends flip up (see frontBulge)
        case "back":
          return 0.85 - 0.3 * smooth(0.5, 1.1, u) // swept back: whole forehead shows
        case "pompadour":
          return 0.8 - 0.3 * smooth(0.5, 1.1, u)
        case "devillock":
          return 0.85 - 0.3 * smooth(0.5, 1.1, u) - 0.95 * smooth(0.2, 0.0, u) // one forward tuft
        case "slant":
          return Math.min(0.75, Math.max(-0.3, 0.2 - 0.42 * d * az)) // a straight diagonal cut
        case "dangle": {
          // centre part with long tendrils hanging in front of the ears
          const arc = 0.6 - 0.45 * smooth(0.02, 0.6, u)
          return Math.min(arc, 0.1 - 1.0 * spike(u, 0.85, 0.22))
        }
        default:
          return 0.22 - 0.1 * Math.cos(az * 5) ** 2 + 0.08 * spike(u, 0, 0.2) // natural: soft scallops
      }
    }
    // extra volume at the front for flips and quiffs
    const frontBulge = (az: number, el: number, e: number): number => {
      const u = Math.abs(az)
      if (fr === "flicked") return 0.16 * smooth(e + 0.3, e, el) * smooth(0.9, 0.2, u)
      if (fr === "pompadour") return 0.22 * smooth(0.6, 1.1, el) * smooth(0.9, 0.0, u)
      if (fr === "devillock") return 0.06 * smooth(0.25, 0, u) * smooth(0.6, -0.2, el)
      return 0
    }
    const back = (az: number): number => {
      const u = Math.PI - Math.abs(az) // 0 at the nape
      if (short) return -0.65 - 0.1 * Math.abs(Math.sin(u * 4))
      if (curly) return -0.7 - 0.12 * Math.abs(Math.sin(u * 5))
      if (bob) return -0.85 + 0.12 * smooth(0, 1.2, u) - 0.12 * Math.abs(Math.sin(u * 3))
      return -1.4 // long styles: everything behind (the fall continues below)
    }
    const edge = (az: number): number => {
      const u = Math.abs(az)
      const fe = Math.min(front(az), u > 0.95 ? sideLvl + (1 - smooth(0.95, 1.35, u)) * 2 : 9)
      const wf = smooth(2.1, 1.35, u) // 1 front .. 0 back
      return wf * Math.min(fe, front(az)) + (1 - wf) * Math.min(back(az), sideLvl)
    }
    // thick, puffy mass well off the skull (Animal Crossing style), rounded rim
    const hr = headR * (covered ? 1.06 : L.hat === "coif" || L.hat === "kerchief" ? 1.08 : 1.0),
      hin = headR * 0.8,
      rho = headR * 0.14
    const lift = covered ? 0 : 0.14 // the clumps hang past the shell edge
    const flick = bob || long || st === "braid" ? 0.2 : 0
    const hairSd = (p: V3) => {
      const x0 = p[0] - hc[0],
        y0 = p[1] - hc[1],
        z0 = p[2] - hc[2]
      const x1 = m0[0] * x0 + m0[1] * y0 + m0[2] * z0 - hOff[0],
        qy0 = m1[0] * x0 + m1[1] * y0 + m1[2] * z0 - hOff[1],
        qy = qy0 > 0 ? qy0 / SQ : qy0,
        qz = m2[0] * x0 + m2[1] * y0 + m2[2] * z0 - hOff[2]
      const r = Math.sqrt(x1 * x1 + qy * qy + qz * qz) || 1e-6
      const el = Math.asin(qy / r),
        az = Math.atan2(x1, qz)
      const e = edge(az)
      // fuller past the cheeks; the hem behind flips outward
      const back = smooth(1.2, 2.0, Math.abs(az))
      const R0 = hr * (1 + 0.05 * smooth(0, -0.8, el) + flick * back * smooth(e + 0.45, e, el) + (1 - back) * frontBulge(az, el, e))
      const shell = Math.max(r - R0, hin - r)
      const cut = (e + lift * smooth(0.2, 0.55, Math.abs(az)) - el) * r // the fringe mass itself reaches the brows // >0: below the edge, no hair
      // rounded intersection: soft, thick edges instead of a knife cut
      const ux = Math.max(0, rho + shell),
        uy = Math.max(0, rho + cut)
      return (Math.min(-rho, Math.max(shell, cut)) + Math.sqrt(ux * ux + uy * uy)) * 0.9
    }
    push({
      kind: "sdf",
      a: add(hc, mv(M, hOff)),
      b: add(hc, mv(M, hOff)),
      r: hr * 1.4,
      r2: 0,
      sd: hairSd,
      flat: 1,
      m: (p, n, l) => {
        // smooth toon shading with one glossy highlight, no strand lines
        const lit = dot(n, l)
        return [hairRamp, covered ? (lit > 0.8 ? 0.14 : 0.05) : 0]
      },
    })
    {
      // Hair clumps: thick tapered locks from the crown, each with its own
      // highlight and a pointed tip, laid round the head and ending along the edge curve
      const soft = L.hat === "coif" || L.hat === "kerchief" || covered // under a hood only the locks framing the face show
      const midR = covered ? 0.98 : soft ? 1.2 : 1.34,
        lw = covered ? 0.55 : soft ? 0.7 : 1 // under cloth headwear the clumps hug the head
      const rootEl = covered ? 0.5 : L.hat ? 0.85 : 1.35 // under a hat the clumps start below its brim
      const tipEl = (az: number, k: number) => Math.max(-1.3, edge(az) - 0.04 - 0.2 * jit(k))
      const nB = short || curly ? 8 : 9
      for (let k = 0; k < nB; k++) {
        const az = -Math.PI + ((k + 0.5) / nB) * Math.PI * 2
        if (Math.abs(az) < 1.0) continue // the face side gets fringe locks
        if (covered && Math.abs(az) > 1.7) continue // the hood hides everything behind the ears
        const te = tipEl(az, k + 3)
        // the bezier never reaches its middle point, so that sits well out to keep the lock proud of the mass
        if (covered) {
          lock({ p0: sp(az * 0.8, L.hat === "helm" ? 0.05 : 0.4, 0.9), p1: sp(az * 0.82, -0.1, 1.04), p2: sp(az * 0.82 + d * 0.05, Math.max(te, -0.75), 1.07), w: 0.12, segs: 5, tipW: 0.012 })
          continue
        } // side locks out of the hood opening
        lock({ p0: sp(az, rootEl, 0.9), p1: sp(az, (1.1 + te) / 2 + 0.1, midR), p2: sp(az + d * 0.12, te, soft ? 1.1 : 1.24), w: (0.19 + 0.03 * jit(k)) * lw, segs: 5, tipW: 0.012 })
      }
      const nF = fr === "back" || fr === "pompadour" ? 3 : 4
      for (let k = 0; k < nF; k++) {
        const az = -0.95 + ((k + 0.5) / nF) * 1.9
        const te = Math.max(0.1, Math.min(0.9, front(az) - 0.1 - 0.1 * jit(k + 11))) // over the brows, stopping at the eyes
        const sw = fr === "swept" || fr === "slant" ? d * 0.25 : fr === "curtain" ? Math.sign(az) * 0.2 : 0
        lock({
          p0: sp(az * 0.4 - sw * 0.5, Math.min(1.3, rootEl), 0.9),
          p1: sp(az, (1.2 + te) / 2 + 0.12, midR),
          p2: sp(az + sw, te, covered ? 1.06 : soft ? 1.1 : 1.2),
          w: 0.15 * lw,
          segs: 5,
          tipW: 0.01,
        })
      }
      // a few on top so the crown reads as clumps too
      if (!L.hat)
        for (let k = 0; k < 3; k++) {
          const az = -Math.PI + (k / 3) * Math.PI * 2 + 0.5
          lock({ p0: sp(az, 1.55, 0.9), p1: sp(az, 1.3, 1.3), p2: sp(az + 0.2, 0.95, 1.2), w: 0.17, segs: 3, tipW: 0.03 })
        }
      if (long) push({ kind: "cone", a: H([0, -0.45, -0.17]), b: H([0, -0.02, -0.1]), r: 0.13 * hs, r2: 0.2 * hs, m: strand, ln: true })
      if (st === "braid") {
        for (const sd of [-1, 1]) {
          for (let k = 0; k < 6; k++) {
            const pt = H([sd * (0.22 - k * 0.006), -0.14 - k * 0.062, -0.02 + k * 0.004])
            push({ kind: "sph", a: pt, b: pt, r: (0.048 - k * 0.004) * hs, r2: 0, sy: 0.85, m: (p, n) => [hairRamp, n[1] > 0 ? 0.12 : -0.08], ln: true })
          }
          lock({ p0: [sd * 0.19, -0.5, 0.01], p1: [sd * 0.2, -0.58, 0.0], p2: [sd * 0.22, -0.64, 0.0], w: 0.03, segs: 2 })
          const rb = H([sd * 0.19, -0.5, 0.01])
          push({ kind: "sph", a: rb, b: rb, r: 0.028 * hs, r2: 0, m: createSolidSurfaceMaterial(L.apron ?? "cRed", 0.1) })
        }
      }
      if (st === "pony") {
        const tie: V3 = [0, 0.1, -0.28]
        const t0 = H([0, 0.12, -0.33])
        void tie
        push({ kind: "sph", a: t0, b: t0, r: 0.035 * hs, r2: 0, m: createSolidSurfaceMaterial(L.apron ?? "cRed", 0.05) })
        lock({ p0: [0, 0.12, -0.34], p1: [0, 0.02, -0.48], p2: [0.02, -0.36, -0.4], w: 0.11, segs: 6, tipW: 0.05 })
      }
      if (st === "bun" && L.hat !== "coif" && L.hat !== "kerchief") {
        const pt = H([0, 0.21, -0.29])
        push({ kind: "sph", a: pt, b: pt, r: 0.105 * hs, r2: 0, m: strand, ln: true })
        lock({ p0: [0, 0.18, -0.34], p1: [0.1, 0.14, -0.4], p2: [0.15, 0.04, -0.36], w: 0.03, segs: 2 })
      }
      if (curly)
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + 0.4
          if (Math.cos(a) > 0.1) continue
          const pt = H([Math.sin(a) * 0.23, 0.12 + (k % 2) * 0.06, Math.cos(a) * 0.21 - 0.03])
          push({ kind: "sph", a: pt, b: pt, r: 0.075 * hs, r2: 0, m: strand, ln: true })
        }
      // ahoge
      if (!L.hat && seed % 3 === 0) lock({ p0: sp(0.3, 1.35, 0.98), p1: sp(0.1, 1.5, 1.5), p2: sp(0.9, 1.2, 1.45), w: 0.03, segs: 4, tipW: 0.004 })
    }
  }
  return { H }
}

type HairContext = ReturnType<typeof buildHair>

export { buildHair, type HairContext }
