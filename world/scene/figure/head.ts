import { qrot } from "../../../lib/engine/quaternion.ts"
import type { BodyContext } from "./context.ts"
import { type M3, add, mv, type V3, mtv, sub } from "../../../lib/graphics/ray/vector.ts"

function buildHead(context: BodyContext) {
  const { child, K, J, push, skin } = context
  // ---- head
  const headR = child ? 0.118 : 0.13
  const hs = headR / (child ? 0.265 : 0.285)
  // hair accessories were laid out for the older, bigger head
  const hq = K.q.head
  const M: M3 = [qrot(hq, [1, 0, 0]), qrot(hq, [0, 1, 0]), qrot(hq, [0, 0, 1])]
  const neckTop = J.head
  const hc = add(neckTop, mv(M, [0, headR * 0.92, 0.01]))
  const SQ = 0.86
  // the skull (and the hair on it) is squashed: a wide, low crown
  const headLocal = (p: V3): V3 => mtv(M, sub(p, hc))
  // into head frame (z = face forward)
  // face: a rounded box (superellipsoid) rather than a ball: flat-ish front and sides,
  // the lower half narrowing into a jaw and a small forward chin
  const [m0, m1, m2] = M
  const headSd = (p: V3) => {
    // headLocal, inlined (hot)
    const x0 = p[0] - hc[0],
      y0 = p[1] - hc[1],
      z0 = p[2] - hc[2]
    const x1 = m0[0] * x0 + m0[1] * y0 + m0[2] * z0,
      qy = m1[0] * x0 + m1[1] * y0 + m1[2] * z0,
      qz = m2[0] * x0 + m2[1] * y0 + m2[2] * z0
    const v = Math.min(1, Math.max(0, -qy / headR)),
      v2 = v * v
    const sx = 0.98 * (1 - 0.36 * v2),
      sz = 0.94 - 0.14 * v2
    const z = qz - 0.1 * headR * v2 * (qz > 0 ? 1 : 0.3)
    const X = Math.abs(x1 / sx) / headR,
      Y = Math.abs(qy / (qy > 0 ? 0.98 * SQ : 0.98)) / headR,
      Z = Math.abs(z / sz) / headR
    const e = 2 + 1.4 * Math.min(1, v * 2.2) // round skull (under the hair), squarer cheeks and jaw
    return ((X ** e + Y ** e + Z ** e) ** (1 / e) - 1) * headR * 0.75
  }
  push({
    kind: "sdf",
    a: hc,
    b: hc,
    r: headR * 1.12,
    r2: 0,
    sd: headSd,
    flat: 0.25,
    m: (p, n) => {
      const hl = headLocal(p)
      // ears get a touch of shade
      return [skin, Math.abs(hl[0]) > headR * 0.95 ? -0.1 : 0.04 + (n[1] > 0.3 ? 0.03 : 0)]
    },
  })
  return { hc, M, hs, headR, SQ, m0, m1, m2, headLocal }
}

type HeadContext = ReturnType<typeof buildHead>

export { buildHead, type HeadContext }
