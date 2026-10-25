// How each building looks from outside (town.md「家の見た目」), worked out from who lives there and
// what they do, never picked by hand: a smith builds in stone against sparks, a woodcutter and a
// woodworker in boards they cut themselves, a well-off house is timber-framed with an overhanging
// upper floor, a modest one has small shuttered windows. The seed only chooses among what fits, and
// neighbours never come out the same.
import { HOUSEHOLDS, HOUSES, floorsOf, type HouseDef } from "./houses.ts";

export type RoofShape = "gable" | "hip" | "shed";
export type WallKind = "plaster" | "timber" | "stone" | "board";
export type WindowKind = "leaded" | "square" | "small";
export type DoorKind = "plank" | "arched" | "double";

export interface HouseStyle {
  roofShape: RoofShape;
  wall: WallKind;
  /** the roof's ramp (scene/pix.ts): its material is the table's (tiles, slate or thatch), the colour the house's */
  roofRamp: "roof" | "roof2" | "roof3" | "slate" | "slate2" | "thatch";
  windows: WindowKind;
  /** shutter colour ramp */
  shutter: string;
  door: DoorKind;
  /** chimneys: none for a barn, two where the hearth and a work fire are apart */
  chimneys: 0 | 1 | 2;
  /** the upper floor overhangs the lower (timber houses of two floors) */
  jetty: boolean;
}

const pick = <T>(xs: readonly T[], seed: number, salt: number): T => xs[Math.abs(Math.imul(seed + 7, 2654435761) ^ Math.imul(salt + 3, 40503)) % xs.length];

/** What a household builds with. */
export function wallsFor(h: HouseDef): WallKind[] {
  const living = HOUSEHOLDS.find((x) => x.id === h.household)?.living;
  // against sparks and thieves, and to keep a cellar cool: stone
  if (["smith", "armorer", "crystal", "warehouse", "tavern"].includes(h.household ?? "")) return ["stone"];
  // those who cut and work wood, and the farm, build in boards
  if (["woodcutter", "woodworker", "farm", "shepherd"].includes(h.household ?? "")) return ["board"];
  if (living === "ゆとりがある" || h.kind === "public") return ["timber", "stone"];
  if (living === "慎ましい") return ["plaster", "board"];
  return ["plaster", "timber"];
}

/** The look a household's life allows; `turn` tries the next of the allowed choices. */
function styleOf(h: HouseDef, turn: number): HouseStyle {
  const hh = HOUSEHOLDS.find((x) => x.id === h.household);
  const living = hh?.living;
  const floors = floorsOf(h);
  const s = h.seed + turn * 101;
  const wall = pick(wallsFor(h), s, 1);
  const roofRamp =
    h.roof === "thatch" ? "thatch" : h.roof === "slate" ? pick(["slate", "slate2"] as const, s, 2) : pick(h.roof === "roof" ? (["roof", "roof3"] as const) : (["roof2", "roof3"] as const), s, 3);
  const small = (h.x1 - h.x0) * (h.z1 - h.z0) < 13;
  const roofShape: RoofShape =
    h.kind === "farm" && small
      ? "shed"
      : h.roof === "thatch"
        ? pick(["hip", "gable"] as const, s, 4)
        : small && floors === 1
          ? pick(["shed", "gable"] as const, s, 5)
          : pick(["gable", "gable", "hip"] as const, s, 6);
  const windows: WindowKind =
    living === "ゆとりがある" || h.kind === "public"
      ? pick(["leaded", "square"] as const, s, 7)
      : living === "慎ましい" || h.kind === "farm"
        ? pick(["small", "square"] as const, s, 9)
        : pick(["square", "leaded", "small"] as const, s, 7);
  const shutter = pick(["cGreen", "cBlue", "cRed", "wood", "cMustard", "cSky", "cWine"], s, 8);
  const door: DoorKind = h.kind === "public" ? "double" : h.kind === "shop" ? "arched" : "plank";
  const workFire = /鍛冶|パン|宿|酒|醸造|調合|薬/.test((hh?.trade ?? "") + (h.plan.workshop ?? "") + h.name);
  const chimneys: 0 | 1 | 2 = !h.plan.hearth ? 0 : h.kind !== "vacant" && workFire && floors > 1 ? 2 : 1;
  const jetty = wall === "timber" && floors > 1;
  return { roofShape, wall, roofRamp, windows, shutter, door, chimneys, jetty };
}

/** A building's look in a few words, to tell neighbours apart. */
export const lookKey = (st: HouseStyle) => `${st.roofShape}/${st.wall}/${st.roofRamp}/${st.windows}`;

/** Buildings on the same map within a few tiles of each other. */
export function neighbours(h: HouseDef, within = 6): HouseDef[] {
  return HOUSES.filter((o) => o.map === h.map && o.id !== h.id && Math.max(o.x0 - h.x1, h.x0 - o.x1, o.z0 - h.z1, h.z0 - o.z1) < within);
}

let memo: Map<string, HouseStyle> | null = null;
/** Each building's look: the first that differs from every neighbour already settled (in the table's order). */
export function houseStyle(h: HouseDef): HouseStyle {
  if (!memo) {
    const settled = new Map<string, HouseStyle>();
    for (const x of HOUSES) {
      let st = styleOf(x, 0);
      for (let turn = 1; turn < 32 && neighbours(x).some((o) => settled.has(o.id) && lookKey(settled.get(o.id)!) === lookKey(st)); turn++) st = styleOf(x, turn);
      settled.set(x.id, st);
    }
    memo = settled;
  }
  return memo.get(h.id) ?? styleOf(h, 0);
}
