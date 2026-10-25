import { poseSkel, clipDur, type Skel, type Proportions } from "../rig";
import type { Look } from "./look.ts";

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
  | "guard";

/** Each villager action plays a stretch of a baked humanoid clip (see rig.ts). */
export interface AnimSpec {
  clip: string;
  n: number;
  t0?: number;
  t1?: number;
  still?: boolean;
  seatY?: number;
  blink?: number[] | true;
}

// frame counts give every anim about 8 frames a second
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
};

export const FRAMES = Object.fromEntries(Object.entries(ANIMS).map(([k, v]) => [k, v.n])) as Record<Anim, number>;

/** Seconds one loop of the anim takes. */
export const ANIM_DUR = Object.fromEntries(Object.entries(ANIMS).map(([k, v]) => [k, clipDur(v.clip) * ((v.t1 ?? 1) - (v.t0 ?? 0))])) as Record<Anim, number>;

// Character proportions: about 3.5 heads tall, narrow shoulders, long slender legs
const SHW = (fem: boolean, S: number) => (fem ? 0.09 : 0.1) * S;

function proportions(L: Look): Proportions {
  const fem = L.sex === "f",
    S = L.age === "child" ? 0.74 : 1;
  return { hipY: (fem ? 0.6 : 0.62) * S, shoulderY: (fem ? 0.39 : 0.41) * S, shW: SHW(fem, S), hipW: (fem ? 0.05 : 0.06) * S, S };
}

function skelFor(L: Look, a: Anim, f: number): Skel {
  const A = ANIMS[a];
  const t = (A.t0 ?? 0) + ((A.t1 ?? 1) - (A.t0 ?? 0)) * (f / A.n);
  return poseSkel(A.clip, { t, still: A.still, seatY: A.seatY }, proportions(L));
}

const blinks = (a: Anim, f: number) => {
  const b = ANIMS[a].blink;
  return b === true || !!b?.includes(f);
};

export { SHW, skelFor, blinks };
