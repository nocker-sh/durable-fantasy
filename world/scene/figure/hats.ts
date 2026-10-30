import type { BodyContext } from "./context"
import type { HeadContext } from "./head"
import type { HairContext } from "./hair"
import { dotVector3 as dot } from "../../../lib/engine/dot-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import { createSolidSurfaceMaterial } from "../../../lib/graphics/ray/create-solid-surface-material"
import { hashSurfacePoint } from "../../../lib/graphics/ray/hash-surface-point"
import { limbSd } from "#/lib/graphics/ray/limb-sd"

function buildHats(context: BodyContext & HeadContext & HairContext) {
  const LSource = context,
    L = LSource.L,
    headR = LSource.headR,
    H = LSource.H,
    push = LSource.push,
    headLocal = LSource.headLocal,
    hs = LSource.hs,
    U = LSource.U,
    shoulderY = LSource.shoulderY,
    shW = LSource.shW,
    hc = LSource.hc
  // ---- hats
  const hatRamp = L.hatRamp ?? "cLinen"
  if (L.hat === "hood") {
    // cowl: deep opening that frames the face, gathered point at the back
    const r = headR * 1.2
    const c0 = H([0, 0.01, -0.03])
    push({
      kind: "sph",
      a: c0,
      b: c0,
      r,
      r2: 0,
      sx: 1.02,
      sy: 1.04,
      sz: 1.06,
      m: (p, n) => {
        const hl = headLocal(p)
        const inner = dot(n, sub(p, c0)) < 0
        return [hatRamp, (inner ? -0.3 : 0) + Math.sin(Math.atan2(hl[0], hl[2]) * 4) * 0.05]
      },
      clip: (p) => {
        const hl = headLocal(p)
        const a = Math.atan2(hl[0], hl[2]),
          yN = hl[1] / r
        // opening: everything in front lower than the brow
        return !(Math.cos(a) > 0.25 && yN < 0.52 - (1 - Math.cos(a)) * 0.2)
      },
    })
    const tip = H([0, 0.16, -0.36])
    push({ kind: "cone", a: H([0, 0.06, -0.2]), b: tip, r: 0.14 * hs, r2: 0.02 * hs, m: createSolidSurfaceMaterial(hatRamp, -0.05) })
    push({
      kind: "cone",
      a: U([0, shoulderY - 0.12, -0.02]),
      b: U([0, shoulderY + 0.03, -0.02]),
      r: shW * 1.35,
      r2: shW * 0.95,
      m: (p, n) => [hatRamp, -0.05 + Math.sin(Math.atan2(n[0], n[2]) * 6) * 0.06],
    })
  } else if (L.hat === "kerchief") {
    // cloth tied over the crown; hair shows at the fringe and below
    const r = headR * 1.5
    const c0 = H([0, 0.02, -0.02])
    push({
      kind: "sph",
      a: c0,
      b: c0,
      r,
      r2: 0,
      m: (p, n) => [hatRamp, Math.sin(Math.atan2(n[0], n[2]) * 5 + n[1] * 4) * 0.06 + (hashSurfacePoint(p) > 0.86 ? 0.15 : 0)],
      clip: (p) => {
        const hl = headLocal(p)
        const a = Math.atan2(hl[0], hl[2]),
          yN = hl[1] / r
        return yN > 0.4 - (1 - Math.cos(a)) * 0.1 // the crown only: hair shows at the sides
      },
    })
    const k1 = H([0, 0.08, -0.3])
    push({ kind: "sph", a: k1, b: k1, r: 0.055 * hs, r2: 0, m: createSolidSurfaceMaterial(hatRamp, 0.05) })
    for (const sd of [-1, 1]) push({ kind: "cap", a: k1, b: H([sd * 0.05, -0.08, -0.33]), r: 0.028 * hs, r2: 0, m: createSolidSurfaceMaterial(hatRamp, -0.05) })
  } else if (L.hat === "coif") {
    // white linen cap with a frilled edge, ties under the chin
    const r = headR * 1.5
    const c0 = H([0, 0.02, -0.03])
    push({
      kind: "sph",
      a: c0,
      b: c0,
      r,
      r2: 0,
      m: (p) => {
        const hl = headLocal(p)
        const a = Math.atan2(hl[0], hl[2]),
          yN = hl[1] / r
        const edge = yN - (0.32 - (1 - Math.cos(a)) * 0.12)
        return ["cLinen", 0.12 + (edge < 0.08 && Math.cos(a) > -0.3 ? (Math.sin(a * 22) > 0 ? 0.12 : -0.12) : 0)]
      },
      clip: (p) => {
        const hl = headLocal(p)
        const a = Math.atan2(hl[0], hl[2]),
          yN = hl[1] / r
        return yN > 0.32 - (1 - Math.cos(a)) * 0.12
      },
    })
  } else if (L.hat === "straw") {
    push({ kind: "cone", a: H([0, 0.2, 0]), b: H([0, 0.22, 0]), r: 0.46 * hs, r2: 0.44 * hs, m: (p) => ["thatch", Math.sin(Math.hypot(p[0] - hc[0], p[2] - hc[2]) * 60) * 0.08 + 0.05] })
    push({ kind: "cone", a: H([0, 0.21, -0.01]), b: H([0, 0.48, -0.02]), r: 0.4 * hs, r2: 0.32 * hs, m: (p) => ["thatch", p[1] - hc[1] < 0.26 * hs ? -0.25 : 0] })
  } else if (L.hat === "cap") {
    // soft cloth cap, gathered at the crown (not a chef's toque)
    push({ kind: "cone", a: H([0, 0.16, -0.02]), b: H([0, 0.27, -0.03]), r: 0.38 * hs, r2: 0.39 * hs, m: createSolidSurfaceMaterial(L.hatRamp ?? "cCream", 0) })
    push({ kind: "sph", a: H([0, 0.29, -0.04]), b: [0, 0, 0], r: 0.4 * hs, r2: 0, sy: 0.5, m: createSolidSurfaceMaterial(L.hatRamp ?? "cCream", 0.05) })
  } else if (L.hat === "helm") {
    // open-faced sallet: a steel bowl down to the brows, cheek plates and a nasal bar
    const c0 = H([0, 0.03, -0.01]),
      r = 0.335 * hs
    push({
      kind: "sph",
      a: c0,
      b: c0,
      r,
      r2: 0,
      sy: 0.95,
      m: (p, n, l) => {
        const hl = headLocal(p)
        return [hatRamp, (hl[1] < 0.02 * hs && Math.cos(Math.atan2(hl[0], hl[2])) > -0.2 ? -0.25 : 0) + (dot(n, l) > 0.75 ? 0.3 : 0)]
      },
      clip: (p) => {
        const hl = headLocal(p)
        const a = Math.atan2(hl[0], hl[2]),
          yN = hl[1] / r
        // face opening below the brow; the back flares down over the nape
        return Math.cos(a) > 0.35 ? yN > 0.3 - (1 - Math.cos(a)) * 0.7 : yN > -0.55
      },
    })
    push({ kind: "cap", a: H([0, 0.17, 0.31]), b: H([0, -0.02, 0.33]), r: 0.022 * hs, r2: 0, m: createSolidSurfaceMaterial(hatRamp, 0.15) })
    push({ kind: "cap", a: H([-0.25, 0.33, -0.02]), b: H([0.25, 0.33, -0.02]), r: 0.02 * hs, r2: 0, m: createSolidSurfaceMaterial(hatRamp, 0.25) }) // crest ridge
  } else if (L.hat === "greathelm") {
    // great helm: a flat-topped steel pot hiding the face, with a dark eye slit and breaths
    const a0 = H([0, -0.3, 0]),
      b0 = H([0, 0.3, -0.01]),
      r = 0.34 * hs
    push({
      kind: "cone",
      a: a0,
      b: b0,
      r: r * 1.02,
      r2: r * 0.94,
      m: (p, n, l) => {
        const hl = headLocal(p),
          front = Math.cos(Math.atan2(hl[0], hl[2]))
        if (front > 0.5 && Math.abs(hl[1] - 0.03 * hs) < 0.03 * hs && Math.abs(hl[0]) > 0.02 * hs) return ["hBlack", 0]
        if (front > 0.6 && Math.abs(hl[0]) < 0.022 * hs && hl[1] < 0.03 * hs) return [hatRamp, 0.3] // reinforcing cross
        return [hatRamp, (dot(n, l) > 0.7 ? 0.3 : 0) + (Math.abs(hl[1] + 0.28 * hs) < 0.03 * hs ? -0.25 : 0)]
      },
    })
    push({ kind: "sph", a: b0, b: b0, r: r * 0.94, r2: 0, sy: 0.3, m: createSolidSurfaceMaterial(hatRamp, 0.2) })
  } else if (L.hat === "beret") {
    push({ kind: "sph", a: H([0.03, 0.33, -0.03]), b: [0, 0, 0], r: 0.4 * hs, r2: 0, sy: 0.34, m: createSolidSurfaceMaterial(hatRamp, 0) })
  }
  if (L.plume && (L.hat === "helm" || L.hat === "greathelm")) {
    // a feather plume sweeping back off the crown
    const p0 = H([0, L.hat === "helm" ? 0.36 : 0.38, 0.0]),
      p1 = H([0, 0.5, -0.12]),
      p2 = H([0, 0.42, -0.36])
    const pl = limbSd([p0, p1, p2], [0.05 * hs, 0.085 * hs, 0.03 * hs])
    push({ kind: "sdf", a: pl.c, b: pl.c, r: pl.r, r2: 0, sd: (p) => pl.sd(p), ln: true, m: (p, n, l) => [L.plume!, dot(n, l) > 0.5 ? 0.15 : -0.05] })
  }
}

export { buildHats }
