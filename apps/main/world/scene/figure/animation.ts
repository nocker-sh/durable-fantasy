import { clipDur } from "#/world/scene/clip-dur"

export type Anim =
  | "idle"
  | "walk"
  | "hammer"
  | "draw"
  | "scrub"
  | "hang"
  | "knead"
  | "sweep"
  | "chop"
  | "scatter"
  | "hoe"
  | "sit"
  | "sell"
  | "pray"
  | "carry"
  | "peel"
  | "look"
  | "play"
  | "pump"
  | "sword"
  | "guard"

/** Each villager action plays a stretch of a baked humanoid clip (see rig.ts). */
export type AnimSpec = {
  clip: string
  n: number
  t0?: number
  t1?: number
  still?: boolean
  seatY?: number
  blink?: number[] | true
}

export const ANIMS: Record<Anim, AnimSpec> = {
  idle: { clip: "Idle_A", n: 25, blink: [4] },
  look: { clip: "Idle_Talking", n: 29 },
  walk: { clip: "Walk", n: 13, still: true },
  carry: { clip: "Walk_Carry", n: 16, still: true },
  play: { clip: "Jog", n: 9, still: true },
  hammer: { clip: "Chop_Tree", n: 8 },
  chop: { clip: "Chop_Tree", n: 8 },
  hoe: { clip: "Chop_Tree", n: 8 },
  draw: { clip: "Interact", n: 20 },
  pump: { clip: "Farm_Watering", n: 31 },
  scrub: { clip: "Fixing_Kneeling", n: 26, t0: 0.25, t1: 0.75 },
  hang: { clip: "Interact", n: 10, t0: 0.2, t1: 0.7 },
  knead: { clip: "PickUp_Table", n: 8 },
  sweep: { clip: "Farm_Watering", n: 31 },
  scatter: { clip: "Farm_PlantSeed", n: 22 },
  sit: { clip: "Sitting_Idle", n: 17, seatY: 0.44, blink: [3] },
  sell: { clip: "Idle_Talking", n: 29 },
  pray: { clip: "Idle_FoldArms", n: 20, blink: true },
  peel: { clip: "PickUp_Table", n: 8 },
  sword: { clip: "Sword_Regular_Combo", n: 24, still: true },
  guard: { clip: "Idle_Sword", n: 17, blink: [5] },
}

export const FRAMES = Object.fromEntries(
  Object.entries(ANIMS).map((entry) => {
    const k = entry[0]
    const v = entry[1]
    return [k, v.n]
  }),
) as Record<Anim, number>

export const ANIM_DUR = Object.fromEntries(
  Object.entries(ANIMS).map((entry2) => {
    const k = entry2[0]
    const v = entry2[1]
    return [k, clipDur(v.clip) * ((v.t1 ?? 1) - (v.t0 ?? 0))]
  }),
) as Record<Anim, number>
