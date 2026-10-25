import { qrot } from "../../../lib/engine/quaternion.ts"
import { attach, type Bone } from "../rig"
import type { BodyContext } from "./context.ts"
import { type SurfaceMaterial, solid } from "../../../lib/graphics/ray/primitives.ts"
import { lerp3, type V3, add, norm, sub, mul, dot } from "../../../lib/graphics/ray/vector.ts"
import { type Ring, loftSd, limbSd } from "../../../lib/graphics/ray/distance.ts"

function buildClothes(context: BodyContext) {
  const { fem, L, local, S, top, along, trimM, UW, J, hip, kneelish, fold, push, openShell, UP, vestM, K, restHip, shoulderY, shW, skin, jacketM } = context
  if (fem || L.robe) {
    // bodice + full skirt reaching the ankles; when seated it drapes over the knees
    const apronM: SurfaceMaterial | null = L.apron
      ? (p) => {
          const lp = local(p, "pelvis")
          return Math.abs(lp[0]) < 0.085 * S && lp[2] > 0.02 && lp[1] < 0.17 * S ? [L.apron!, 0.05] : [top, 0]
        }
      : null
    const skirtM: SurfaceMaterial = (p, n) => {
      if (apronM) {
        const r = apronM(p, n, n)
        if (r[0] !== top) return r
      }
      const fl = Math.sin(Math.atan2(n[0], n[2]) * 7) * 0.06
      const az = Math.atan2(n[0], n[2])
      if (along(p, skirtBase, skirtTop) < 0.1 + 0.035 * Math.abs(Math.sin(az * 5))) return trimM(top, fl) // scalloped band
      return [top, fl]
    }
    const skirtTop = UW([0, 0.2 * S - 0.06 * S, 0])
    const knees = lerp3(J.calf_l, J.calf_r, 0.5)
    const hemY = L.robe ? 0.05 : L.skirt === "short" ? 0.35 : L.skirt === "mid" ? 0.27 : 0.2
    const stand: V3 = [hip[0] * 0.7 + skirtTop[0] * 0.3, hemY * S, hip[2] * 0.7 + skirtTop[2] * 0.3 + 0.01]
    const seat: V3 = kneelish ? [knees[0], 0.04, (knees[2] + hip[2]) / 2] : add(knees, [0, -0.1 * S, 0.02])
    const skirtBase = lerp3(stand, seat, fold)
    const skR = (kneelish ? 0.22 : L.robe ? 0.17 : L.skirt && L.skirt !== "long" ? 0.215 : 0.2) * S
    // shorter skirts flare from a nipped waist
    const skW = (L.skirt && L.skirt !== "long" ? 0.1 : 0.11) * S
    push({ kind: "cone", a: skirtBase, b: skirtTop, r: skR, r2: skW, m: skirtM })
    if (L.overskirt && !L.robe) {
      // overskirt: a shell a little outside the skirt, parted down the front and a bit shorter
      const ax = norm(sub(skirtTop, skirtBase))
      openShell(add(skirtBase, mul(ax, 0.04 * S)), add(skirtTop, mul(ax, 0.01 * S)), skR * 1.06, skW * 1.1, "pelvis", 0.02 * S, 0.3, L.overskirt)
    }
    if (L.frill && !L.robe) {
      // petticoat: a white ruffle peeking out under the hem
      const ax = norm(sub(skirtTop, skirtBase))
      push({
        kind: "cone",
        a: add(skirtBase, mul(ax, -0.03 * S)),
        b: add(skirtBase, mul(ax, 0.03 * S)),
        r: skR * 0.97,
        r2: skR * 0.94,
        m: (p, n) => ["cCream", 0.1 + (Math.sin(Math.atan2(n[0], n[2]) * 12) > 0 ? 0.08 : -0.1)],
      })
    }
    if (L.apron) push({ kind: "cap", a: UW([-0.1 * S, 0.17 * S, 0.05]), b: UW([0.1 * S, 0.17 * S, 0.05]), r: 0.022, r2: 0, m: solid(L.apron, 0.1) })
  } else {
    // tunic flaring to mid-thigh + belt
    const hem = UP([0, -0.13 * S, 0.0]),
      waist = UW([0, 0.1 * S, 0])
    const apronM: SurfaceMaterial = (p) => {
      const lp = local(p, "pelvis")
      if (L.apron && Math.abs(lp[0]) < 0.11 * S && lp[2] > 0.03) return [L.apron, 0]
      if (L.vest) return vestM(p)
      if (along(p, hem, waist) < 0.45 && !L.jacket) return trimM(top)
      return [top, 0]
    }
    push({ kind: "cone", a: hem, b: UW([0, 0.1 * S, 0]), r: 0.16 * S, r2: 0.125 * S, m: apronM })
    if (L.belt !== false) {
      push({ kind: "cone", a: UW([0, 0.1 * S, 0]), b: UW([0, 0.135 * S, 0]), r: 0.126 * S, r2: 0.126 * S, m: solid("leather", -0.05) })
      const bk = UW([0, 0.118 * S, 0.12 * S])
      push({ kind: "cap", a: add(bk, [-0.012 * S, 0, 0]), b: add(bk, [0.012 * S, 0, 0]), r: 0.017 * S, r2: 0, m: solid("gold", 0.1), flat: 0.8 })
      // a pouch on the right hip
      const pu = UW([-0.1 * S, 0.075 * S, 0.065 * S])
      push({ kind: "cap", a: add(pu, [0, 0.022 * S, 0]), b: pu, r: 0.032 * S, r2: 0, m: solid("leather", 0.08) })
    }
  }
  // ---- torso: cross-section rings along the spine joined by straight sides (a loft, like
  // the intended faceted silhouette): hips, waist, chest, a wide shoulder ring and a
  // narrow neck ring, so the shoulder line slopes straight into the neck with no seam
  {
    const wide = !fem
    const at = (b: Bone, y: number): V3 => attach(K, b, add(restHip, [0, y, 0]))
    const rings: Ring[] = [
      { c: J.pelvis, q: K.q.pelvis, w: (wide ? 0.12 : 0.1) * S, d: 0.08 * S },
      { c: J.spine_01, q: K.q.spine_01, w: (wide ? 0.11 : 0.085) * S, d: 0.074 * S },
      { c: J.spine_02, q: K.q.spine_02, w: (wide ? 0.12 : 0.095) * S, d: 0.078 * S },
      { c: at("spine_03", shoulderY - 0.09 * S), q: K.q.spine_03, w: shW + 0.025 * S, d: 0.075 * S },
      { c: at("spine_03", shoulderY + 0.012 * S), q: K.q.spine_03, w: 0.036 * S, d: 0.036 * S },
      { c: add(J.head, qrot(K.q.head, [0, 0.05 * S, 0.006])), q: K.q.head, w: 0.032 * S, d: 0.032 * S },
    ]
    const COLLAR = 3 // segment from the shoulder ring to the neck ring: skin above its upper part
    const lo = loftSd(rings)
    const field = lo.sd,
      bc = lo.c,
      bodyR = lo.r
    const bod = L.bodice ?? top
    const under = (p: V3, h: { i: number; t: number }): [string, number] => {
      if (!fem && L.apron) {
        const lp = local(p, "pelvis")
        if (Math.abs(lp[0]) < 0.08 * S && lp[2] > 0.03 && lp[1] < 0.2 * S) return [L.apron, 0]
      }
      if (fem) {
        if (L.bodice && h.i >= COLLAR) return ["cLinen", 0] // blouse at the shoulders
        const lp = local(p, "spine_03")
        if (L.bodice && Math.abs(lp[0]) < 0.014 && lp[2] > 0) return ["cLinen", 0.2] // lacing
        return [bod, 0]
      }
      if (L.vest) return vestM(p)
      return [top, 0]
    }
    push({
      kind: "sdf",
      a: bc,
      b: bc,
      r: bodyR,
      r2: 0,
      sd: (p) => field(p),
      m: (p, n, l) => {
        const h = { i: 0, t: 0 }
        field(p, h)
        if (h.i > COLLAR || (h.i === COLLAR && h.t > 0.55)) return [skin, -0.06]
        if (L.armor && (h.i === 1 || h.i === 2 || (h.i === COLLAR && h.t < 0.35))) {
          // breastplate: a bright ridge down the middle and a dark rolled edge at the waist and neck
          const lp = local(p, "spine_02")
          if ((h.i === 1 && h.t < 0.18) || (h.i === COLLAR && h.t > 0.25)) return [L.armor, -0.3]
          return [L.armor, (lp[2] > 0 && Math.abs(lp[0]) < 0.012 * S ? 0.3 : 0) + (dot(n, l) > 0.75 ? 0.25 : 0)]
        }
        // a bolero stops above the waist; a coat covers the whole torso
        if (L.jacket && (!fem || h.i >= 2 || (h.i === 1 && h.t > 0.55))) return jacketM(p, under(p, h))
        return under(p, h)
      },
    })
    if (L.jacket && !fem && !L.robe) {
      // coat skirts: from the waist to the knee, parted in front
      openShell(UP([0, -0.3 * S, -0.01]), UW([0, 0.1 * S, 0]), 0.205 * S, 0.138 * S, "pelvis", 0.02 * S, 0.3, L.jacket)
    }
  }
  // ---- collar: a short loft sitting on the shoulder slope round the neck (under a neck wrap)
  const collar = L.collar === undefined ? (L.robe ? null : "cLinen") : L.collar
  if (collar && !L.neck) {
    const at = (b: Bone, y: number, z = 0): V3 => attach(K, b, add(restHip, [0, y, z]))
    const co = loftSd([
      { c: at("spine_03", shoulderY - 0.1 * S, 0.006), q: K.q.spine_03, w: shW + 0.02 * S, d: 0.088 * S },
      { c: at("spine_03", shoulderY - 0.075 * S, 0.006), q: K.q.spine_03, w: shW - 0.01 * S, d: 0.08 * S },
      { c: at("spine_03", shoulderY + 0.012 * S), q: K.q.spine_03, w: 0.052 * S, d: 0.052 * S },
    ])
    push({
      kind: "sdf",
      a: co.c,
      b: co.c,
      r: co.r,
      r2: 0,
      sd: (p) => co.sd(p),
      m: (p) => {
        const h = { i: 0, t: 0 }
        co.sd(p, h)
        return [collar, h.i === 0 ? -0.12 : 0.04]
      },
    })
  }
  // ---- neck wrap: a muffler (thick, a tail down the chest), a stole (over the shoulders, long
  // ends in front) or a scarf (thin, knotted at the throat)
  if (L.neck) {
    const at = (b: Bone, y: number, z = 0): V3 => attach(K, b, add(restHip, [0, y, z]))
    const ramp = L.neckRamp ?? "cRed"
    const X = qrot(K.q.spine_03, [1, 0, 0]),
      Y = qrot(K.q.spine_03, [0, 1, 0]),
      Z = qrot(K.q.spine_03, [0, 0, 1])
    const knit: SurfaceMaterial = (p) => {
      const lp = local(p, "spine_03")
      const band = Math.floor((lp[1] + 1) / (0.022 * S)) % 2 === 0
      return [L.neckStripe && band ? L.neckStripe : ramp, band ? 0.06 : -0.02]
    }
    if (L.neck === "muffler") {
      const mu = loftSd([
        { c: at("spine_03", shoulderY - 0.045 * S, 0.008), q: K.q.spine_03, w: 0.105 * S, d: 0.1 * S },
        { c: at("spine_03", shoulderY + 0.01 * S, 0.008), q: K.q.spine_03, w: 0.096 * S, d: 0.094 * S },
        { c: at("spine_03", shoulderY + 0.055 * S, 0.006), q: K.q.spine_03, w: 0.078 * S, d: 0.08 * S },
      ])
      push({ kind: "sdf", a: mu.c, b: mu.c, r: mu.r, r2: 0, sd: (p) => mu.sd(p), m: knit })
      // the loose end hangs down the chest, a little to one side
      const top0 = add(at("spine_03", shoulderY - 0.01 * S), add(mul(Z, 0.095 * S), mul(X, 0.035 * S)))
      const tail = limbSd([top0, add(top0, add(mul(Y, -0.09 * S), mul(Z, 0.014 * S))), add(top0, add(mul(Y, -0.18 * S), mul(Z, 0.006 * S)))], [0.04 * S, 0.037 * S, 0.035 * S])
      push({ kind: "sdf", a: tail.c, b: tail.c, r: tail.r, r2: 0, sd: (p) => tail.sd(p), flat: 0.6, m: knit })
    } else if (L.neck === "stole") {
      const st = loftSd([
        { c: at("spine_03", shoulderY + 0.02 * S), q: K.q.spine_03, w: 0.06 * S, d: 0.06 * S },
        { c: at("spine_03", shoulderY - 0.04 * S, 0.004), q: K.q.spine_03, w: shW + 0.03 * S, d: 0.092 * S },
        { c: at("spine_03", shoulderY - 0.07 * S, 0.004), q: K.q.spine_03, w: shW + 0.035 * S, d: 0.096 * S },
      ])
      push({ kind: "sdf", a: st.c, b: st.c, r: st.r, r2: 0, sd: (p) => st.sd(p), m: knit })
      for (const sd of [-1, 1]) {
        const top0 = add(at("spine_03", shoulderY - 0.06 * S), add(mul(Z, 0.08 * S), mul(X, sd * 0.05 * S)))
        const end = limbSd([top0, add(top0, mul(Y, -0.12 * S)), add(top0, mul(Y, -0.24 * S))], [0.024 * S, 0.023 * S, 0.022 * S])
        push({ kind: "sdf", a: end.c, b: end.c, r: end.r, r2: 0, sd: (p) => end.sd(p), flat: 0.85, m: knit })
      }
    } else {
      const sc = loftSd([
        { c: at("spine_03", shoulderY - 0.015 * S, 0.006), q: K.q.spine_03, w: 0.085 * S, d: 0.083 * S },
        { c: at("spine_03", shoulderY + 0.025 * S, 0.004), q: K.q.spine_03, w: 0.072 * S, d: 0.072 * S },
      ])
      push({ kind: "sdf", a: sc.c, b: sc.c, r: sc.r, r2: 0, sd: (p) => sc.sd(p), m: knit })
      const knot = add(at("spine_03", shoulderY - 0.01 * S), mul(Z, 0.085 * S))
      push({ kind: "sph", a: knot, b: knot, r: 0.028 * S, r2: 0, m: () => [ramp, 0.12] })
      for (const sd of [-1, 1]) push({ kind: "cap", a: knot, b: add(knot, add(mul(X, sd * 0.03 * S), mul(Y, -0.09 * S))), r: 0.02 * S, r2: 0, m: knit })
    }
  }
  {
    const at = (b: Bone, y: number, z = 0): V3 => attach(K, b, add(restHip, [0, y, z]))
    if (L.cape) {
      // short shoulder cape: flares from the neck over the shoulders, with a trimmed edge
      const cp = loftSd([
        { c: at("spine_03", shoulderY + 0.004 * S), q: K.q.spine_03, w: 0.058 * S, d: 0.058 * S },
        { c: at("spine_03", shoulderY - 0.06 * S, 0.004), q: K.q.spine_03, w: shW + 0.045 * S, d: 0.1 * S },
        { c: at("spine_03", shoulderY - 0.12 * S, 0.004), q: K.q.spine_03, w: shW + 0.075 * S, d: 0.12 * S },
      ])
      push({
        kind: "sdf",
        a: cp.c,
        b: cp.c,
        r: cp.r,
        r2: 0,
        sd: (p) => cp.sd(p),
        m: (p) => {
          const h = { i: 0, t: 0 }
          cp.sd(p, h)
          return h.i === 1 && h.t > 0.72 ? trimM(L.cape!, 0.05) : [L.cape!, 0.05]
        },
      })
    }
    if (L.bow) {
      // ribbon bow at the throat: a knot, two loops and two short tails
      const c0 = at("spine_03", shoulderY - 0.035 * S, (L.cape ? 0.095 : 0.072) * S + 0.012)
      const X = qrot(K.q.spine_03, [1, 0, 0]),
        Y = qrot(K.q.spine_03, [0, 1, 0])
      const bw = limbSd([add(c0, add(mul(X, -0.04 * S), mul(Y, 0.01 * S))), c0, add(c0, add(mul(X, 0.04 * S), mul(Y, 0.01 * S)))], [0.022 * S, 0.012 * S, 0.022 * S])
      push({ kind: "sdf", a: bw.c, b: bw.c, r: bw.r, r2: 0, sd: (p) => bw.sd(p), flat: 0.8, m: solid(L.bow, 0.12) })
      for (const sd of [-1, 1]) push({ kind: "cap", a: c0, b: add(c0, add(mul(X, sd * 0.02 * S), mul(Y, -0.05 * S))), r: 0.01 * S, r2: 0, m: solid(L.bow, -0.02) })
      push({ kind: "sph", a: c0, b: c0, r: 0.013 * S, r2: 0, m: solid(L.bow, 0.2) })
    }
    if (L.buttons && !L.bodice) {
      for (const y of [0.05, 0.1, 0.15]) {
        const c0 = attach(K, "spine_02", add(K.rest.spine_02, [0, y * S - 0.02 * S, 0.079 * S]))
        push({ kind: "sph", a: c0, b: c0, r: 0.011 * S, r2: 0, m: solid(L.buttons, 0.15), flat: 0.8 })
      }
    }
  }
  return { collar }
}

type ClothesContext = ReturnType<typeof buildClothes>

export { buildClothes, type ClothesContext }
