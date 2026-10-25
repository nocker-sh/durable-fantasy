import { qrot } from "../../../lib/engine/quaternion.ts"
import type { ArmsContext } from "./arms.ts"
import type { BodyContext } from "./context.ts"
import { type V3, norm, add, mul, sub, cross, dot, lerp3 } from "../../../lib/graphics/ray/vector.ts"
import { solid } from "../../../lib/graphics/ray/primitives.ts"
import { frameSd } from "../../../lib/graphics/ray/distance.ts"

function buildHeldItem(context: ArmsContext & BodyContext) {
  const { hands, item, push, K, U, shoulderY } = context
  // ---- held item
  const R = hands.R,
    Lh = hands.L
  const iw = "wood",
    ii = "iron"
  const fwdOf = (h: { p: V3; dir: V3; up: V3 }) => h.up
  if (item === "hammer" || item === "axe") {
    const g = norm(add(mul(fwdOf(R), 1), mul(R.dir, 0.2)))
    const end = add(R.p, mul(g, item === "axe" ? 0.32 : 0.22))
    push({ kind: "cap", a: add(R.p, mul(g, -0.04)), b: end, r: 0.018, r2: 0, m: solid(iw, 0.1) })
    if (item === "hammer") push({ kind: "cap", a: add(end, mul(R.dir, -0.05)), b: add(end, mul(R.dir, 0.05)), r: 0.035, r2: 0, m: solid(ii, 0.1) })
    else push({ kind: "sph", a: add(end, mul(R.dir, 0.04)), b: [0, 0, 0], r: 0.06, r2: 0, sx: 0.5, m: solid(ii, 0.15) })
  } else if (item === "hoe") {
    const g = norm(fwdOf(R))
    const a0 = add(R.p, mul(g, -0.2)),
      end = add(R.p, mul(g, 0.62))
    push({ kind: "cap", a: a0, b: end, r: 0.018, r2: 0, m: solid(iw, 0.1) })
    push({ kind: "cap", a: end, b: add(end, mul(R.dir, 0.12)), r: 0.03, r2: 0, m: solid(ii, 0.1) })
  } else if (item === "broom" || item === "peel") {
    const ground: V3 = [R.p[0] * 0.3, 0.06, 0.48]
    const g = norm(sub(ground, R.p))
    const top0 = add(R.p, mul(g, -0.25))
    push({ kind: "cap", a: top0, b: ground, r: 0.018, r2: 0, m: solid(iw, 0.1) })
    if (item === "broom") push({ kind: "cone", a: add(ground, mul(g, 0.06)), b: add(ground, mul(g, -0.16)), r: 0.08, r2: 0.03, m: (p) => ["thatch", Math.sin(p[0] * 120) * 0.12] })
    else push({ kind: "sph", a: ground, b: [0, 0, 0], r: 0.12, r2: 0, sy: 0.25, m: solid(iw, 0.15) })
  } else if (item === "staff" || item === "spear") {
    const base: V3 = [R.p[0] + 0.02, 0.0, R.p[2] + 0.02]
    const topP: V3 = [R.p[0] + 0.02, R.p[1] + 0.55, R.p[2] + 0.02]
    push({ kind: "cap", a: base, b: topP, r: 0.02, r2: 0, m: solid(iw, 0.05) })
    if (item === "spear") push({ kind: "cone", a: topP, b: add(topP, [0, 0.16, 0]), r: 0.04, r2: 0.002, m: solid(ii, 0.2) })
    else push({ kind: "cap", a: topP, b: add(topP, [0, 0.03, 0.06]), r: 0.024, r2: 0, m: solid(iw, 0.05) })
  } else if (item === "sword") {
    // arming sword: grip through the fist, crossguard, blade
    const g = R.up
    const guard = add(R.p, mul(g, 0.05))
    push({ kind: "cap", a: add(R.p, mul(g, -0.05)), b: guard, r: 0.016, r2: 0, m: solid("leather", 0.05) })
    const side = norm(cross(g, R.dir))
    push({ kind: "cap", a: add(guard, mul(side, -0.055)), b: add(guard, mul(side, 0.055)), r: 0.014, r2: 0, m: solid(ii, 0.15) })
    push({ kind: "cone", a: add(guard, mul(g, 0.01)), b: add(guard, mul(g, 0.56)), r: 0.03, r2: 0.01, m: (p, n, l) => [ii, dot(n, l) > 0.6 ? 0.35 : 0.2] })
  } else if (item === "greatsword") {
    // two-handed sword: long grip, wide guard, broad blade with a bright fuller
    const g = R.up,
      side = norm(cross(g, R.dir))
    const guard = add(R.p, mul(g, 0.07))
    push({ kind: "cap", a: add(R.p, mul(g, -0.1)), b: guard, r: 0.017, r2: 0, m: solid("leather", 0.05) })
    push({ kind: "sph", a: add(R.p, mul(g, -0.115)), b: [0, 0, 0], r: 0.026, r2: 0, m: solid("gold", 0.2) })
    push({ kind: "cap", a: add(guard, mul(side, -0.09)), b: add(guard, mul(side, 0.09)), r: 0.017, r2: 0, m: solid("gold", 0.15) })
    const tip = add(guard, mul(g, 0.82))
    const bl = frameSd(
      lerp3(guard, tip, 0.5),
      side,
      g,
      norm(cross(side, g)),
      (x, y, z) => {
        const w = 0.036 * Math.min(1, (0.41 - y) / 0.1)
        return Math.max(Math.abs(x) - w, Math.abs(y) - 0.41, Math.abs(z) - 0.008) * 0.9
      },
      0.45,
    )
    push({
      kind: "sdf",
      a: bl.c,
      b: bl.c,
      r: bl.r,
      r2: 0,
      sd: bl.sd,
      m: (p, n, l) => {
        const [x] = bl.loc(p)
        return [ii, Math.abs(x) < 0.008 ? 0.4 : dot(n, l) > 0.5 ? 0.25 : 0.1]
      },
    })
  } else if (item === "mace") {
    // flanged mace: short haft, a steel head ringed with flanges
    const g = norm(add(R.up, mul(R.dir, 0.15)))
    const head = add(R.p, mul(g, 0.27))
    push({ kind: "cap", a: add(R.p, mul(g, -0.06)), b: head, r: 0.017, r2: 0, m: solid("leather", 0.05) })
    push({ kind: "sph", a: head, b: [0, 0, 0], r: 0.042, r2: 0, m: (p, n, l) => [ii, dot(n, l) > 0.6 ? 0.3 : 0.05] })
    const a1 = norm(cross(g, R.dir)),
      a2 = norm(cross(g, a1))
    for (let k = 0; k < 6; k++) {
      const t = (k / 6) * Math.PI * 2,
        o = add(mul(a1, Math.cos(t) * 0.045), mul(a2, Math.sin(t) * 0.045))
      push({ kind: "cap", a: add(add(head, o), mul(g, -0.035)), b: add(add(head, o), mul(g, 0.03)), r: 0.014, r2: 0, m: solid(ii, 0.15) })
    }
    push({ kind: "cone", a: add(head, mul(g, 0.04)), b: add(head, mul(g, 0.08)), r: 0.016, r2: 0.002, m: solid(ii, 0.2) })
  } else if (item === "battleaxe") {
    // bearded war axe: long haft, one deep crescent blade
    const g = norm(add(R.up, mul(R.dir, 0.2))),
      side = norm(cross(g, R.dir)),
      bd = norm(cross(side, g))
    const end = add(R.p, mul(g, 0.42))
    push({ kind: "cap", a: add(R.p, mul(g, -0.08)), b: add(end, mul(g, 0.03)), r: 0.019, r2: 0, m: solid(iw, 0.1) })
    // blade in the plane of the haft and its swing direction (bd), hanging toward the hand
    const bc = add(end, mul(bd, 0.085))
    const ax = frameSd(
      bc,
      bd,
      g,
      side,
      (x, y, z) => {
        const d2 = Math.max(Math.hypot(x - 0.02, y + 0.02) - 0.1, -(x + 0.06), Math.hypot(x + 0.09, y + 0.03) * -1 + 0.075)
        return Math.max(d2, Math.abs(z) - 0.01 + Math.max(0, x) * 0.05) * 0.9
      },
      0.15,
    )
    push({
      kind: "sdf",
      a: ax.c,
      b: ax.c,
      r: ax.r,
      r2: 0,
      sd: ax.sd,
      m: (p, n, l) => {
        const [x, y] = ax.loc(p)
        return [ii, Math.hypot(x - 0.02, y + 0.02) > 0.08 ? 0.4 : dot(n, l) > 0.5 ? 0.2 : 0.05]
      },
    })
  } else if (item === "halberd") {
    // halberd planted beside the bearer: spike, axe blade and a back hook on a tall pole
    const base: V3 = [R.p[0] + 0.02, 0.0, R.p[2] + 0.02]
    const topP: V3 = [R.p[0] + 0.02, R.p[1] + 0.62, R.p[2] + 0.02]
    push({ kind: "cap", a: base, b: topP, r: 0.019, r2: 0, m: solid(iw, 0.05) })
    push({ kind: "cone", a: topP, b: add(topP, [0, 0.19, 0]), r: 0.03, r2: 0.002, m: solid(ii, 0.25) })
    const fwd = qrot(K.q.spine_02, [0, 0, 1]),
      sideW = norm(cross([0, 1, 0], fwd))
    const hb = frameSd(
      add(topP, add(mul(fwd, 0.07), [0, -0.03, 0])),
      fwd,
      [0, 1, 0],
      sideW,
      (x, y, z) => {
        const d2 = Math.max(Math.abs(y) - 0.075 - x * 0.35, x - 0.06, -x - 0.06)
        return Math.max(d2, Math.abs(z) - 0.009) * 0.9
      },
      0.12,
    )
    push({
      kind: "sdf",
      a: hb.c,
      b: hb.c,
      r: hb.r,
      r2: 0,
      sd: hb.sd,
      m: (p, n, l) => {
        const [x] = hb.loc(p)
        return [ii, x > 0.045 ? 0.4 : dot(n, l) > 0.5 ? 0.2 : 0.05]
      },
    })
    push({ kind: "cone", a: add(topP, [0, -0.03, 0]), b: add(add(topP, mul(fwd, -0.1)), [0, -0.06, 0]), r: 0.02, r2: 0.003, m: solid(ii, 0.15) })
  } else if (item === "bucket") {
    const c0 = add(R.p, [0, -0.17, 0.01])
    push({ kind: "cone", a: c0, b: add(c0, [0, 0.14, 0]), r: 0.07, r2: 0.085, m: (p) => ["wood", Math.abs(p[1] - c0[1] - 0.04) < 0.012 || Math.abs(p[1] - c0[1] - 0.11) < 0.012 ? -0.35 : 0.05] })
    push({ kind: "cap", a: add(c0, [-0.075, 0.14, 0]), b: R.p, r: 0.008, r2: 0, m: solid(ii, 0) })
  } else if (item === "basket") {
    const c0 = add(Lh.p, [0.05, -0.08, 0.06])
    push({ kind: "cone", a: c0, b: add(c0, [0, 0.11, 0]), r: 0.085, r2: 0.11, m: (p) => ["thatch", ((Math.floor(p[1] * 90) + Math.floor(Math.atan2(p[0] - c0[0], p[2] - c0[2]) * 5)) % 2) * 0.12] })
    push({ kind: "sph", a: add(c0, [0, 0.12, 0]), b: [0, 0, 0], r: 0.09, r2: 0, sy: 0.5, m: (p, n) => [n[0] > 0 ? "cRed" : "cGreen", 0.15] })
  } else if (item === "sack") {
    const c0 = U([-0.1, shoulderY + 0.08, -0.08])
    push({ kind: "sph", a: c0, b: [0, 0, 0], r: 0.13, r2: 0, sx: 1.3, sy: 0.85, m: (p, n) => ["sand", 0.05 + n[1] * 0.05] })
  } else if (item === "cloth") {
    const c0 = lerp3(R.p, Lh.p, 0.5)
    push({ kind: "sph", a: add(c0, [0, -0.1, 0.03]), b: [0, 0, 0], r: 0.15, r2: 0, sy: 0.9, sz: 0.25, m: solid("cLinen", 0.15) })
  }
}

export { buildHeldItem }
