// Humanoid skeleton for the sprite villagers. Bone names follow the Mesh2Motion convention
// (anims.json was baked from its clips; README「素材」). Clips are
// stored as world-space rotation deltas from a T-pose, so they drive our chibi proportions
// directly: child = parent + delta(parent) * restOffset.
import data from "./anims.json"

type V3 = [number, number, number]
export type Q = [number, number, number, number]
export interface ClipData {
  bones: string[]
  clips: Record<string, { dur: number; f: number[][] }>
}

let D: ClipData = data as ClipData
/** Swap the clip library (preview tools load the full bake). */
export function setClipData(d: ClipData) {
  D = d
}
export const clipDur = (name: string) => D.clips[name]?.dur ?? 1

export type Bone =
  | "pelvis"
  | "spine_01"
  | "spine_02"
  | "spine_03"
  | "neck_01"
  | "head"
  | "clavicle_l"
  | "upperarm_l"
  | "lowerarm_l"
  | "hand_l"
  | "clavicle_r"
  | "upperarm_r"
  | "lowerarm_r"
  | "hand_r"
  | "thigh_l"
  | "calf_l"
  | "foot_l"
  | "ball_l"
  | "thigh_r"
  | "calf_r"
  | "foot_r"
  | "ball_r"
const PARENT: Record<Bone, Bone | null> = {
  pelvis: null,
  spine_01: "pelvis",
  spine_02: "spine_01",
  spine_03: "spine_02",
  neck_01: "spine_03",
  head: "neck_01",
  clavicle_l: "spine_03",
  upperarm_l: "clavicle_l",
  lowerarm_l: "upperarm_l",
  hand_l: "lowerarm_l",
  clavicle_r: "spine_03",
  upperarm_r: "clavicle_r",
  lowerarm_r: "upperarm_r",
  hand_r: "lowerarm_r",
  thigh_l: "pelvis",
  calf_l: "thigh_l",
  foot_l: "calf_l",
  ball_l: "foot_l",
  thigh_r: "pelvis",
  calf_r: "thigh_r",
  foot_r: "calf_r",
  ball_r: "foot_r",
}
const ORDER = Object.keys(PARENT) as Bone[] // parents before children

export { qrot } from "../../lib/engine/quaternion.ts"
import { qrot } from "../../lib/engine/quaternion.ts"

let bendDamp = 1
/** 0 = play clips as authored, 1 = full chibi softening of torso bends */
export function setBendDamp(k: number) {
  bendDamp = k
}
const BEND: [Bone, number][] = [
  ["pelvis", 0.7],
  ["spine_01", 0.55],
  ["spine_02", 0.55],
  ["spine_03", 0.6],
  ["neck_01", 0.6],
  ["head", 0.6],
]
// world deltas compose along the chain, so scale each one relative to its parent
const scaleQ = (q: Q, k: number): Q => {
  const s = Math.hypot(q[0], q[1], q[2])
  if (s < 1e-6) return q
  const a = 2 * Math.atan2(s, q[3]) * k,
    f = Math.sin(a / 2) / s
  return [q[0] * f, q[1] * f, q[2] * f, Math.cos(a / 2)]
}

/** Rest (T-pose) joint positions for one body type; the character faces +Z, its left is +X. */
export interface Proportions {
  hipY: number
  shoulderY: number
  shW: number
  hipW: number
  S: number
}
export function restPose(P: Proportions): Record<Bone, V3> {
  const { hipY: h, shoulderY: sh, shW, hipW, S } = P
  const r = {} as Record<Bone, V3>
  const arm = h + sh - 0.105 * S,
    up = 0.17 * S,
    fo = 0.15 * S // arms hang from low, sloping shoulders
  r.pelvis = [0, h, 0]
  r.spine_01 = [0, h + 0.06 * S, 0]
  r.spine_02 = [0, h + 0.15 * S, 0]
  r.spine_03 = [0, h + 0.25 * S, 0]
  r.neck_01 = [0, h + sh - 0.02, 0]
  r.head = [0, h + sh + 0.048 * S, 0] // a short visible neck
  for (const [s, x] of [
    ["l", 1],
    ["r", -1],
  ] as const) {
    const ax = x * (shW + 0.025 * S)
    r[`clavicle_${s}`] = [x * 0.02 * S, arm - 0.01, 0.02 * S]
    r[`upperarm_${s}`] = [ax, arm, 0]
    r[`lowerarm_${s}`] = [ax + x * up, arm, 0]
    r[`hand_${s}`] = [ax + x * (up + fo), arm, 0]
    const lx = x * hipW
    r[`thigh_${s}`] = [lx, h, 0]
    r[`calf_${s}`] = [lx, h * 0.51, 0.003]
    r[`foot_${s}`] = [lx, 0.045 * S, -0.015 * S]
    r[`ball_${s}`] = [lx, 0.008, 0.05 * S]
  }
  return r
}

export interface Skel {
  p: Record<Bone, V3>
  q: Record<Bone, Q>
  rest: Record<Bone, V3>
}
export interface Sample {
  /** fraction of the clip, 0..1 */
  t: number
  /** pin the pelvis horizontally (strips root motion and drift) */
  still?: boolean
  /** lift the pelvis to this height (seats are taller than the chibi legs) */
  seatY?: number
}

/** Pose the skeleton at one moment of a clip. */
export function poseSkel(clip: string, s: Sample, P: Proportions): Skel {
  const C = D.clips[clip] ?? D.clips.Idle_A
  const n = C.f.length
  const fi = Math.min(n - 1, Math.max(0, Math.round(s.t * n) % n))
  const row = C.f[fi]
  const rest = restPose(P)
  const q = {} as Record<Bone, Q>
  D.bones.forEach((b, k) => {
    const x = row[3 + k * 3],
      y = row[4 + k * 3],
      z = row[5 + k * 3]
    q[b as Bone] = [x, y, z, Math.sqrt(Math.max(0, 1 - x * x - y * y - z * z))]
  })
  // big heads on short bodies: soften the torso bends so heads stay clear of the ground
  if (bendDamp > 0) for (const [b, k] of BEND) q[b] = scaleQ(q[b], 1 - (1 - k) * bendDamp)
  const legLen = P.hipY - 0.045 * P.S
  let ox = row[0] * legLen,
    oy = row[1] * legLen,
    oz = row[2] * legLen
  if (s.still) {
    ox = 0
    oz = 0
  }
  const p = {} as Record<Bone, V3>
  p.pelvis = [rest.pelvis[0] + ox, s.seatY ?? rest.pelvis[1] + oy, rest.pelvis[2] + oz]
  for (const b of ORDER) {
    const pa = PARENT[b]
    if (!pa) continue
    const off: V3 = [rest[b][0] - rest[pa][0], rest[b][1] - rest[pa][1], rest[b][2] - rest[pa][2]]
    const r = qrot(q[pa], off)
    p[b] = [p[pa][0] + r[0], p[pa][1] + r[1], p[pa][2] + r[2]]
  }
  return { p, q, rest }
}

/** Carry a point given in rest space along with a bone. */
export function attach(K: Skel, b: Bone, restPt: V3): V3 {
  const r = K.rest[b],
    o = qrot(K.q[b], [restPt[0] - r[0], restPt[1] - r[1], restPt[2] - r[2]])
  return [K.p[b][0] + o[0], K.p[b][1] + o[1], K.p[b][2] + o[2]]
}
