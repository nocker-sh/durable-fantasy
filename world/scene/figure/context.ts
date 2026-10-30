import { cylinderBounds } from "../../../lib/graphics/ray/cylinder-bounds"
import { qrot } from "../../../lib/engine/qrot"
import { attach } from "#/world/scene/attach"
import type { Skel, Bone } from "#/world/scene/rig"
import type { Look, Item } from "./look"
import type { Primitive } from "../../../lib/graphics/ray/primitive-types"
import { type Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"
import { addVector3 as add } from "../../../lib/engine/add-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import { dotVector3 as dot } from "../../../lib/engine/dot-vector3"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { shoulderHalfWidth } from "#/world/scene/figure/helpers/animation/shoulder-half-width"
import { KNEELING_KNEE_HEIGHT } from "#/world/scene/figure/kneeling-knee-height"

function createBodyContext(L: Look, K: Skel, item: Item) {
  const prims: Primitive[] = []
  let id = 0
  const fem = L.sex === "f"
  const child = L.age === "child"
  const S = child ? 0.74 : 1
  // body scale; the head shrinks less (cuter)
  const skin = L.skin
  const top = L.top
  const shoes = L.shoes ?? "leather"
  const push = (p: Omit<Primitive, "id"> & { id?: number }) => {
    const primitive: Primitive = { ...p, id: p.id ?? id++ }
    prims.push(primitive)
    return primitive
  }
  const J = K.p
  const restHip = K.rest.pelvis
  // points given relative to the rest hip, carried by a bone
  const UP = (v: V3): V3 => attach(K, "pelvis", add(restHip, v))
  const UW = (v: V3): V3 => attach(K, "spine_01", add(restHip, v))
  const U = (v: V3): V3 => attach(K, "spine_03", add(restHip, v))
  const hip = J.pelvis
  // how folded the legs are: 0 standing .. 1 thighs level (sitting / kneeling)
  const thighLen = (K.rest.pelvis[1] - K.rest.foot_l[1]) / 2,
    foldRange = 0.7
  const foldRaw = 1 - ((J.pelvis[1] - (J.calf_l[1] + J.calf_r[1]) / 2) / thighLen - 0.15) / foldRange
  const fold = Math.min(1, Math.max(0, foldRaw))
  const kneelish = Math.min(J.calf_l[1], J.calf_r[1]) < KNEELING_KNEE_HEIGHT * S
  // ---- legs
  const legRamp = L.bottom ?? (fem ? "cLinen" : "cBrown")
  const foot_: NonNullable<Look["footwear"]> = L.footwear ?? (L.boots === false || L.robe ? "shoes" : "boots")
  const legs = L.legs ?? "tucked"
  // a band of trim along an edge: same ramp darker, or the trim ramp
  const trimM = (ramp: string, off = 0): [string, number] => (L.trim ? [L.trim, 0.05] : [ramp, off - 0.4])
  const along = (p: V3, a: V3, b: V3) => {
    const ab = sub(b, a)
    return dot(sub(p, a), ab) / (dot(ab, ab) || 1)
  }
  // jerkin: its colour everywhere but a narrow opening down the front showing the tunic
  const vestM = (p: V3): [string, number] => {
    const lp = local(p, "spine_02")
    const open = 0.016 * S + Math.max(0, lp[1]) * 0.12
    if (lp[2] > 0 && Math.abs(lp[0]) < open) return [top, 0.05]
    return Math.abs(lp[0]) < open + 0.012 * S && lp[2] > 0 ? [L.vest!, -0.3] : [L.vest!, 0]
  }
  // an open-front garment shell (coat tails, overskirt): a thin cone with a wedge cut out of the front;
  // the opening widens by `flare` per unit of length toward the hem; inside faces get a darker lining
  const openShell = (inputProps: { hemC: V3; topC: V3; rHem: number; rTop: number; frame: Bone; open: number; flare: number; ramp: string }) => {
    const hemC = inputProps.hemC
    const topC = inputProps.topC
    const rHem = inputProps.rHem
    const rTop = inputProps.rTop
    const frame = inputProps.frame
    const open = inputProps.open
    const flare = inputProps.flare
    const ramp = inputProps.ramp

    const base = limbSd([hemC, topC], [rHem, rTop]),
      th = 0.01 * S
    const cutOf = (p: V3) => {
      const lp = local(p, frame),
        t = 1 - Math.min(1, Math.max(0, along(p, hemC, topC)))
      return Math.min(open + t * flare * Math.hypot(...sub(topC, hemC)) - Math.abs(lp[0]), lp[2])
    }
    const len = Math.hypot(...sub(topC, hemC))
    // open at both ends: the round cone's end caps are sliced off
    const ends = (p: V3) => {
      const u = along(p, hemC, topC)
      return Math.max(-u, u - 1) * len
    }
    return push({
      kind: "sdf",
      a: base.c,
      b: base.c,
      r: base.r,
      r2: 0,
      sdLipschitz: 1 + Math.abs(flare),
      capsuleBounds: base.capsuleBounds,
      bounds: cylinderBounds(hemC, topC, Math.max(rHem, rTop)),
      sd: (p) => Math.max(Math.abs(base.sd(p) + th) - th, cutOf(p), ends(p)),
      m: (p) => {
        if (base.sd(p) < -th) return [ramp, -0.3] // lining
        if (cutOf(p) > -0.014 * S) return trimM(ramp, 0) // front edge
        return along(p, hemC, topC) < 0.07 ? trimM(ramp, 0) : [ramp, 0]
      },
    })
  }
  // jacket over the torso: its colour except a front opening (narrow at the neck, cut away
  // below the chest on a bolero); edges trimmed
  const jacketM = (p: V3, fallback: [string, number]): [string, number] => {
    const lp = local(p, "spine_02")
    const below = Math.max(0, 0.08 * S - lp[1])
    const open = 0.012 * S + below * (fem ? 0.9 : 0.35) + Math.max(0, lp[1] - 0.1 * S) * 0.25
    if (lp[2] > 0 && Math.abs(lp[0]) < open) return fallback
    if (lp[2] > 0 && Math.abs(lp[0]) < open + 0.014 * S) return trimM(L.jacket!, 0.05)
    return [L.jacket!, 0]
  }
  // ---- torso / clothes
  const shoulderY = (fem ? 0.39 : 0.41) * S
  const shW = shoulderHalfWidth(fem, S)
  const local = (p: V3, b: Bone): V3 => {
    const q = K.q[b]
    return qrot([-q[0], -q[1], -q[2], q[3]], sub(p, J[b]))
  }
  return {
    J,
    foot_,
    fem,
    push,
    fold,
    foldRaw,
    foldSensitivity: 1 / (foldRange * thighLen),
    legRamp,
    legs,
    S,
    L,
    shoes,
    along,
    local,
    top,
    trimM,
    UW,
    hip,
    kneelish,
    openShell,
    UP,
    vestM,
    K,
    restHip,
    shoulderY,
    shW,
    skin,
    jacketM,
    child,
    U,
    item,
    prims,
  }
}

type BodyContext = ReturnType<typeof createBodyContext>

export { createBodyContext, type BodyContext }
