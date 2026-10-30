import { getSkirtDimensions } from "#/world/scene/figure/get-skirt-dimensions"
import { getDrapedSkirtGeometry } from "#/world/scene/figure/get-draped-skirt-geometry"
import { buildDrapedOverskirt } from "#/world/scene/figure/build-draped-overskirt"
import { getTunicGeometry } from "#/world/scene/figure/get-tunic-geometry"
import { buildCoatTails } from "#/world/scene/figure/build-coat-tails"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import { qrot } from "#/lib/engine/qrot"
import { attach } from "#/world/scene/attach"
import type { Bone } from "#/world/scene/rig"
import type { BodyContext } from "#/world/scene/figure/context"
import { createSolidSurfaceMaterial } from "#/lib/graphics/ray/create-solid-surface-material"
import type { SurfaceMaterial } from "#/lib/graphics/ray/primitive-types"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
import { type Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { dotVector3 as dot } from "#/lib/engine/dot-vector3"
import type { Ring } from "#/lib/graphics/ray/distance-types"
import { loftSd } from "#/lib/graphics/ray/loft-sd"
import { limbSd } from "#/lib/graphics/ray/limb-sd"

function buildClothes(context: BodyContext) {
  const femSource = context,
    fem = femSource.fem,
    L = femSource.L,
    local = femSource.local,
    S = femSource.S,
    top = femSource.top,
    along = femSource.along,
    trimM = femSource.trimM,
    UW = femSource.UW,
    J = femSource.J,
    hip = femSource.hip,
    kneelish = femSource.kneelish,
    fold = femSource.fold,
    push = femSource.push,
    openShell = femSource.openShell,
    vestM = femSource.vestM,
    K = femSource.K,
    restHip = femSource.restHip,
    shoulderY = femSource.shoulderY,
    shW = femSource.shW,
    skin = femSource.skin,
    jacketM = femSource.jacketM
  const tunicParts: Primitive[] = [],
    coatTailParts: Primitive[] = [],
    skirtParts: Primitive[] = []
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
      if (skirtProgress(p) < 0.1 + 0.035 * Math.abs(Math.sin(az * 5))) return trimM(top, fl) // scalloped band
      return [top, fl]
    }
    const skirtDimensions = getSkirtDimensions(context)
    const skirtTop = UW([0, skirtDimensions.waistRise, 0])
    const knees = lerp3(J.calf_l, J.calf_r, 0.5)
    const stand: V3 = [hip[0] * 0.7 + skirtTop[0] * 0.3, skirtDimensions.hemHeight, hip[2] * 0.7 + skirtTop[2] * 0.3 + 0.01]
    const seat: V3 = kneelish ? [knees[0], 0.04, (knees[2] + hip[2]) / 2] : add(knees, [0, -0.1 * S, 0.02])
    const skirtBase = lerp3(stand, seat, fold)
    const skR = skirtDimensions.hemRadius
    // shorter skirts flare from a nipped waist
    const skW = skirtDimensions.waistRadius
    const draped = fold > 0 && !kneelish,
      skirtGeometry = draped ? getDrapedSkirtGeometry(context, "skirt") : null
    if (skirtGeometry instanceof Error) throw skirtGeometry
    const skirtProgress = skirtGeometry ? skirtGeometry.progress : (point: V3) => along(point, skirtBase, skirtTop)
    skirtParts.push(push(skirtGeometry ? { ...skirtGeometry.shape, m: skirtM } : { kind: "cone", a: skirtBase, b: skirtTop, r: skR, r2: skW, m: skirtM }))
    if (L.overskirt && !L.robe) {
      // overskirt: a shell a little outside the skirt, parted down the front and a bit shorter
      const ax = norm(sub(skirtTop, skirtBase))
      skirtParts.push(
        draped
          ? buildDrapedOverskirt(context)
          : openShell({
              hemC: add(skirtBase, mul(ax, 0.04 * S)),
              topC: add(skirtTop, mul(ax, 0.01 * S)),
              rHem: skR * 1.06,
              rTop: skW * 1.1,
              frame: "pelvis",
              open: 0.02 * S,
              flare: 0.3,
              ramp: L.overskirt,
            }),
      )
    }
    if (L.frill && !L.robe) {
      // petticoat: a white ruffle peeking out under the hem
      const ax = norm(sub(skirtTop, skirtBase))
      const frill = draped ? getDrapedSkirtGeometry(context, "frill") : null
      if (frill instanceof Error) throw frill
      skirtParts.push(
        push({
          kind: "cone",
          a: add(skirtBase, mul(ax, -0.03 * S)),
          b: add(skirtBase, mul(ax, 0.03 * S)),
          r: skR * 0.97,
          r2: skR * 0.94,
          ...frill?.shape,
          m: (p, n) => ["cCream", 0.1 + (Math.sin(Math.atan2(n[0], n[2]) * 12) > 0 ? 0.08 : -0.1)],
        }),
      )
    }
    if (L.apron) push({ kind: "cap", a: UW([-0.1 * S, 0.17 * S, 0.05]), b: UW([0.1 * S, 0.17 * S, 0.05]), r: 0.022, r2: 0, m: createSolidSurfaceMaterial(L.apron, 0.1) })
  } else {
    // tunic flaring to mid-thigh + belt
    const tunic = getTunicGeometry(context)
    if (tunic instanceof Error) throw tunic
    const apronM: SurfaceMaterial = (p) => {
      const lp = local(p, "pelvis")
      if (L.apron && Math.abs(lp[0]) < 0.11 * S && lp[2] > 0.03) return [L.apron, 0]
      if (L.vest) return vestM(p)
      if (tunic.progress(p) < 0.45 && !L.jacket) return trimM(top)
      return [top, 0]
    }
    tunicParts.push(push({ ...tunic.shape, m: apronM }))
    if (L.belt !== false) {
      push({ kind: "cone", a: UW([0, 0.1 * S, 0]), b: UW([0, 0.135 * S, 0]), r: 0.126 * S, r2: 0.126 * S, m: createSolidSurfaceMaterial("leather", -0.05) })
      const bk = UW([0, 0.118 * S, 0.12 * S])
      push({ kind: "cap", a: add(bk, [-0.012 * S, 0, 0]), b: add(bk, [0.012 * S, 0, 0]), r: 0.017 * S, r2: 0, m: createSolidSurfaceMaterial("gold", 0.1), flat: 0.8 })
      // a pouch on the right hip
      const pu = UW([-0.1 * S, 0.075 * S, 0.065 * S])
      push({ kind: "cap", a: add(pu, [0, 0.022 * S, 0]), b: pu, r: 0.032 * S, r2: 0, m: createSolidSurfaceMaterial("leather", 0.08) })
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
      bounds: lo.bounds,
      boxBounds: lo.boxBounds,
      separationFields: lo.separationFields,
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
      coatTailParts.push(buildCoatTails(context))
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
      bounds: co.bounds,
      boxBounds: co.boxBounds,
      separationFields: co.separationFields,
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
      push({ kind: "sdf", bounds: mu.bounds, boxBounds: mu.boxBounds, separationFields: mu.separationFields, a: mu.c, b: mu.c, r: mu.r, r2: 0, sd: (p) => mu.sd(p), m: knit })
      // the loose end hangs down the chest, a little to one side
      const top0 = add(at("spine_03", shoulderY - 0.01 * S), add(mul(Z, 0.095 * S), mul(X, 0.035 * S)))
      const tail = limbSd([top0, add(top0, add(mul(Y, -0.09 * S), mul(Z, 0.014 * S))), add(top0, add(mul(Y, -0.18 * S), mul(Z, 0.006 * S)))], [0.04 * S, 0.037 * S, 0.035 * S])
      push({ kind: "sdf", sdLipschitz: 1, bounds: tail.bounds, capsuleBounds: tail.capsuleBounds, a: tail.c, b: tail.c, r: tail.r, r2: 0, sd: (p) => tail.sd(p), flat: 0.6, m: knit })
    } else if (L.neck === "stole") {
      const st = loftSd([
        { c: at("spine_03", shoulderY + 0.02 * S), q: K.q.spine_03, w: 0.06 * S, d: 0.06 * S },
        { c: at("spine_03", shoulderY - 0.04 * S, 0.004), q: K.q.spine_03, w: shW + 0.03 * S, d: 0.092 * S },
        { c: at("spine_03", shoulderY - 0.07 * S, 0.004), q: K.q.spine_03, w: shW + 0.035 * S, d: 0.096 * S },
      ])
      push({ kind: "sdf", bounds: st.bounds, boxBounds: st.boxBounds, separationFields: st.separationFields, a: st.c, b: st.c, r: st.r, r2: 0, sd: (p) => st.sd(p), m: knit })
      for (const sd of [-1, 1]) {
        const top0 = add(at("spine_03", shoulderY - 0.06 * S), add(mul(Z, 0.08 * S), mul(X, sd * 0.05 * S)))
        const end = limbSd([top0, add(top0, mul(Y, -0.12 * S)), add(top0, mul(Y, -0.24 * S))], [0.024 * S, 0.023 * S, 0.022 * S])
        push({ kind: "sdf", sdLipschitz: 1, bounds: end.bounds, capsuleBounds: end.capsuleBounds, a: end.c, b: end.c, r: end.r, r2: 0, sd: (p) => end.sd(p), flat: 0.85, m: knit })
      }
    } else {
      const sc = loftSd([
        { c: at("spine_03", shoulderY - 0.015 * S, 0.006), q: K.q.spine_03, w: 0.085 * S, d: 0.083 * S },
        { c: at("spine_03", shoulderY + 0.025 * S, 0.004), q: K.q.spine_03, w: 0.072 * S, d: 0.072 * S },
      ])
      push({ kind: "sdf", bounds: sc.bounds, boxBounds: sc.boxBounds, separationFields: sc.separationFields, a: sc.c, b: sc.c, r: sc.r, r2: 0, sd: (p) => sc.sd(p), m: knit })
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
        separationFields: cp.separationFields,
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
      push({ kind: "sdf", sdLipschitz: 1, capsuleBounds: bw.capsuleBounds, a: bw.c, b: bw.c, r: bw.r, r2: 0, sd: (p) => bw.sd(p), flat: 0.8, m: createSolidSurfaceMaterial(L.bow, 0.12) })
      for (const sd of [-1, 1]) push({ kind: "cap", a: c0, b: add(c0, add(mul(X, sd * 0.02 * S), mul(Y, -0.05 * S))), r: 0.01 * S, r2: 0, m: createSolidSurfaceMaterial(L.bow, -0.02) })
      push({ kind: "sph", a: c0, b: c0, r: 0.013 * S, r2: 0, m: createSolidSurfaceMaterial(L.bow, 0.2) })
    }
    if (L.buttons && !L.bodice) {
      for (const y of [0.05, 0.1, 0.15]) {
        const c0 = attach(K, "spine_02", add(K.rest.spine_02, [0, y * S - 0.02 * S, 0.079 * S]))
        push({ kind: "sph", a: c0, b: c0, r: 0.011 * S, r2: 0, m: createSolidSurfaceMaterial(L.buttons, 0.15), flat: 0.8 })
      }
    }
  }
  return { collar, tunicParts, coatTailParts, skirtParts }
}

type ClothesContext = ReturnType<typeof buildClothes>

export { buildClothes, type ClothesContext }
