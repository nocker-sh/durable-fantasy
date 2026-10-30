import data from "#resources/world/scene/anims"

export type V3 = [number, number, number]

export type Q = [number, number, number, number]

export type ClipData = {
  bones: string[]
  clips: Record<string, { dur: number; f: number[][] }>
}

export const D: { value: ClipData } = { value: data as ClipData }

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

export const PARENT: Record<Bone, Bone | null> = {
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

export const BONE_ORDER: ReadonlyArray<Bone> = Object.freeze(Object.keys(PARENT).filter((bone): bone is Bone => Object.hasOwn(PARENT, bone)))

export const bendDamp = { value: 1 }

/** Rest (T-pose) joint positions for one body type; the character faces +Z, its left is +X. */
export type Proportions = {
  hipY: number
  shoulderY: number
  shW: number
  hipW: number
  S: number
}

export type HandGrip = {
  axis: V3
  across: V3
  halfWidth: number
  halfDepth: number
}

export type Skel = {
  handGrips?: Partial<Record<"l" | "r", HandGrip>>
  p: Record<Bone, V3>
  q: Record<Bone, Q>
  rest: Record<Bone, V3>
}

export type Sample = {
  /** fraction of the clip, 0..1 */
  t: number
  /** pin the pelvis horizontally (strips root motion and drift) */
  still?: boolean
  /** lift the pelvis to this height (seats are taller than the chibi legs) */
  seatY?: number
}
