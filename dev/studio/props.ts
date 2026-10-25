// Small pixel props that explain a motion: a tree to chop, a well to draw from, water to
// swim in. Each is drawn once into a PixBuf with the village ramps and a dark outline.
import { PixBuf, pick, hash2, RAMPS, OUTLINE, type RGB } from "#/world/scene/pix.ts";

export type PropKind =
  | "tree"
  | "field"
  | "sprouts"
  | "crops"
  | "well"
  | "tub"
  | "table"
  | "chest"
  | "bench"
  | "mat"
  | "fence"
  | "pond"
  | "wall"
  | "crate"
  | "cart"
  | "dummy"
  | "target"
  | "grave"
  | "bush"
  | "hurdle"
  | "lamppost"
  | "brazier";

/** Where the prop goes: in front of the character, or under them (bench, pond, mat). */
export const PROP_PLACE: Record<PropKind, "front" | "under" | "behind"> = {
  tree: "front",
  field: "front",
  sprouts: "front",
  crops: "front",
  well: "front",
  tub: "front",
  table: "front",
  chest: "front",
  bench: "under",
  mat: "under",
  fence: "front",
  pond: "under",
  wall: "front",
  crate: "front",
  cart: "front",
  dummy: "front",
  target: "front",
  grave: "behind",
  bush: "front",
  hurdle: "front",
  lamppost: "behind",
  brazier: "front",
};
/** Distance in front, in tiles (props further away read as ranged targets). */
export const PROP_DIST: Partial<Record<PropKind, number>> = { target: 3, dummy: 1, hurdle: 1 };

export interface PropSprite {
  buf: PixBuf;
  ax: number;
  ay: number;
}

type Shade = (x: number, y: number) => number; // 0..1 brightness

function blob(b: PixBuf, cx: number, cy: number, rx: number, ry: number, ramp: string, shade?: Shade) {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x - cx) / rx,
        dy = (y - cy) / ry;
      if (dx * dx + dy * dy > 1) continue;
      const l = shade ? shade(x, y) : 0.75 - dx * 0.25 - dy * 0.3;
      b.set(x, y, pick(ramp, l, x, y));
    }
}
function box(b: PixBuf, x0: number, y0: number, w: number, h: number, ramp: string, shade?: Shade) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const l = shade ? shade(x, y) : 0.7 - ((x - x0) / Math.max(1, w)) * 0.3;
      b.set(x, y, pick(ramp, l, x, y));
    }
}
const at = (ramp: string, i: number): RGB => RAMPS[ramp][Math.min(RAMPS[ramp].length - 1, i)];

const DRAW: Record<PropKind, () => PropSprite> = {
  tree() {
    const b = new PixBuf(48, 76);
    box(b, 20, 44, 8, 30, "wood", (x) => 0.75 - (x - 20) / 10);
    for (let x = 16; x < 32; x++) b.set(x, 74, at("wood", 1));
    for (const [cx, cy, r] of [
      [24, 26, 18],
      [14, 34, 11],
      [34, 34, 11],
      [24, 14, 12],
    ] as const)
      blob(b, cx, cy, r, r * 0.9, "leaf", (x, y) => 0.95 - (x - 10) / 60 - (y - 4) / 50 + (hash2(x >> 1, y >> 1) - 0.5) * 0.2);
    b.outline(OUTLINE);
    return { buf: b, ax: 24, ay: 74 };
  },
  field() {
    return field(0);
  },
  sprouts() {
    return field(1);
  },
  crops() {
    return field(2);
  },
  well() {
    const b = new PixBuf(40, 50);
    box(b, 4, 26, 32, 20, "stone", (x, y) => 0.8 - (x - 4) / 50 + ((y - 26) % 5 === 0 ? -0.25 : 0) + ((x + (((y - 26) / 5) | 0) * 4) % 8 === 0 ? -0.2 : 0));
    blob(b, 20, 26, 16, 5, "stone", () => 0.85);
    blob(b, 20, 26, 12, 3.5, "water", (x) => 0.35 + (x - 8) / 60);
    box(b, 5, 4, 3, 23, "wood");
    box(b, 32, 4, 3, 23, "wood");
    box(b, 3, 2, 34, 4, "timber", () => 0.8);
    for (let y = 6; y < 18; y++) b.set(20, y, at("wood", 1));
    box(b, 17, 17, 7, 6, "wood", () => 0.65);
    b.outline(OUTLINE);
    return { buf: b, ax: 20, ay: 46 };
  },
  tub() {
    const b = new PixBuf(34, 20);
    box(b, 3, 6, 28, 12, "wood", (x, y) => 0.75 - (x - 3) / 50 + ((x - 3) % 6 === 0 ? -0.3 : 0) + (y === 9 || y === 15 ? -0.4 : 0));
    blob(b, 17, 6, 14, 4, "wood", () => 0.85);
    blob(b, 17, 6, 12, 3, "water", () => 0.7);
    blob(b, 13, 6, 5, 2, "cLinen", () => 0.9);
    b.outline(OUTLINE);
    return { buf: b, ax: 17, ay: 18 };
  },
  table() {
    const b = new PixBuf(40, 30);
    box(b, 2, 8, 36, 6, "wood", () => 0.85);
    box(b, 2, 14, 36, 2, "wood", () => 0.4);
    box(b, 4, 16, 3, 12, "wood", () => 0.5);
    box(b, 33, 16, 3, 12, "wood", () => 0.5);
    blob(b, 14, 7, 6, 3.5, "thatch", () => 0.85);
    blob(b, 27, 7, 4, 3, "cLinen", () => 0.9);
    blob(b, 27, 5, 3, 1.5, "cWine", () => 0.6);
    b.outline(OUTLINE);
    return { buf: b, ax: 20, ay: 28 };
  },
  chest() {
    const b = new PixBuf(30, 24);
    box(b, 3, 10, 24, 12, "wood", (x) => 0.75 - (x - 3) / 40);
    blob(b, 15, 10, 12, 6, "wood", (x, y) => 0.95 - (x - 3) / 40 - (y - 4) / 30);
    box(b, 3, 10, 24, 2, "gold", () => 0.7);
    box(b, 13, 10, 4, 12, "gold", () => 0.6);
    box(b, 14, 13, 2, 3, "iron", () => 0.2);
    b.outline(OUTLINE);
    return { buf: b, ax: 15, ay: 22 };
  },
  bench() {
    const b = new PixBuf(44, 20);
    box(b, 2, 4, 40, 5, "wood", () => 0.85);
    box(b, 2, 9, 40, 2, "wood", () => 0.4);
    box(b, 5, 11, 3, 8, "wood", () => 0.5);
    box(b, 36, 11, 3, 8, "wood", () => 0.5);
    b.outline(OUTLINE);
    return { buf: b, ax: 22, ay: 16 };
  },
  mat() {
    const b = new PixBuf(52, 16);
    blob(b, 26, 8, 24, 6, "thatch", (x, y) => 0.7 + (((x + y) & 3) === 0 ? -0.2 : 0));
    blob(b, 10, 7, 7, 3, "cLinen", () => 0.9);
    b.outline(OUTLINE);
    return { buf: b, ax: 26, ay: 8 };
  },
  fence() {
    const b = new PixBuf(52, 30);
    for (const x of [4, 24, 44]) box(b, x, 2, 4, 26, "wood", (xx) => 0.8 - (xx - x) / 8);
    box(b, 2, 8, 48, 3, "wood", () => 0.75);
    box(b, 2, 18, 48, 3, "wood", () => 0.6);
    b.outline(OUTLINE);
    return { buf: b, ax: 26, ay: 28 };
  },
  pond() {
    const b = new PixBuf(80, 34);
    blob(b, 40, 17, 39, 16, "stone", () => 0.6);
    blob(b, 40, 17, 36, 14, "water", (x, y) => 0.45 + (y - 3) / 60 + ((x + y * 3) % 11 === 0 ? 0.35 : 0));
    return { buf: b, ax: 40, ay: 17 };
  },
  wall() {
    const b = new PixBuf(48, 30);
    box(b, 2, 4, 44, 24, "stone", (x, y) => 0.75 - (x - 2) / 80 + ((y - 4) % 6 === 0 ? -0.3 : 0) + ((x + (((y - 4) / 6) | 0) * 5) % 10 === 0 ? -0.25 : 0));
    box(b, 2, 2, 44, 3, "stone", () => 0.95);
    b.outline(OUTLINE);
    return { buf: b, ax: 24, ay: 28 };
  },
  crate() {
    const b = new PixBuf(28, 28);
    box(b, 2, 4, 24, 22, "wood", (x, y) => 0.75 - (x - 2) / 40 + (x === 3 || x === 24 || y === 5 || y === 24 ? -0.35 : 0) + (Math.abs(x - 2 - (y - 4)) < 1.5 ? -0.25 : 0));
    box(b, 2, 2, 24, 3, "wood", () => 0.95);
    b.outline(OUTLINE);
    return { buf: b, ax: 14, ay: 26 };
  },
  cart() {
    const b = new PixBuf(56, 38);
    box(b, 6, 8, 44, 16, "wood", (x, y) => 0.75 - (y - 8) / 40 + ((y - 8) % 5 === 0 ? -0.3 : 0));
    blob(b, 14, 27, 9, 9, "wood", (x, y) => (Math.hypot(x - 14, y - 27) > 6.5 || x === 14 || y === 27 ? 0.35 : 0));
    blob(b, 42, 27, 9, 9, "wood", (x, y) => (Math.hypot(x - 42, y - 27) > 6.5 || x === 42 || y === 27 ? 0.35 : 0));
    for (let x = 0; x < 8; x++) b.set(x, 14, at("wood", 2));
    blob(b, 28, 6, 12, 4, "thatch", () => 0.85);
    b.outline(OUTLINE);
    return { buf: b, ax: 28, ay: 36 };
  },
  dummy() {
    const b = new PixBuf(28, 54);
    box(b, 13, 20, 3, 33, "wood", () => 0.5);
    box(b, 3, 22, 22, 3, "wood", () => 0.6);
    blob(b, 14, 32, 8, 12, "thatch", (x, y) => 0.85 - (x - 6) / 30 + (y % 4 === 0 ? -0.2 : 0));
    blob(b, 14, 12, 7, 7, "cLinen", (x, y) => 0.95 - (x - 7) / 25 - (y - 5) / 30);
    b.set(12, 11, OUTLINE);
    b.set(16, 11, OUTLINE);
    b.outline(OUTLINE);
    return { buf: b, ax: 14, ay: 52 };
  },
  target() {
    const b = new PixBuf(30, 44);
    box(b, 7, 22, 3, 20, "wood", () => 0.5);
    box(b, 20, 22, 3, 20, "wood", () => 0.5);
    for (const [r, ramp] of [
      [13, "cLinen"],
      [10, "cRed"],
      [7, "cLinen"],
      [4, "cRed"],
    ] as const)
      blob(b, 15, 16, r, r, ramp, () => 0.85);
    b.outline(OUTLINE);
    return { buf: b, ax: 15, ay: 42 };
  },
  grave() {
    const b = new PixBuf(26, 34);
    box(b, 5, 10, 16, 20, "stone", (x) => 0.8 - (x - 5) / 30);
    blob(b, 13, 10, 8, 7, "stone", (x) => 0.85 - (x - 5) / 30);
    box(b, 12, 9, 2, 10, "stone", () => 0.3);
    box(b, 9, 12, 8, 2, "stone", () => 0.3);
    blob(b, 13, 31, 12, 3, "mud", () => 0.5);
    b.outline(OUTLINE);
    return { buf: b, ax: 13, ay: 31 };
  },
  bush() {
    const b = new PixBuf(40, 26);
    for (const [cx, cy, r] of [
      [12, 15, 9],
      [27, 15, 10],
      [20, 10, 9],
    ] as const)
      blob(b, cx, cy, r, r * 0.85, "leaf2", (x, y) => 0.9 - (x - 3) / 60 - (y - 2) / 30 + (hash2(x >> 1, y >> 1, 3) - 0.5) * 0.25);
    b.outline(OUTLINE);
    return { buf: b, ax: 20, ay: 24 };
  },
  hurdle() {
    const b = new PixBuf(40, 20);
    box(b, 4, 2, 3, 17, "wood", () => 0.5);
    box(b, 33, 2, 3, 17, "wood", () => 0.5);
    box(b, 2, 3, 36, 3, "cRed", () => 0.8);
    box(b, 2, 10, 36, 2, "cLinen", () => 0.8);
    b.outline(OUTLINE);
    return { buf: b, ax: 20, ay: 19 };
  },
  lamppost() {
    const b = new PixBuf(20, 70);
    box(b, 9, 14, 3, 54, "iron", () => 0.4);
    box(b, 5, 66, 11, 3, "iron", () => 0.3);
    box(b, 5, 4, 11, 12, "glass", () => 0.4);
    box(b, 7, 6, 7, 8, "fire", () => 0.85);
    box(b, 4, 2, 13, 3, "iron", () => 0.5);
    b.outline(OUTLINE);
    return { buf: b, ax: 10, ay: 68 };
  },
  brazier() {
    const b = new PixBuf(24, 40);
    box(b, 10, 18, 4, 20, "iron", () => 0.4);
    blob(b, 12, 18, 9, 4, "iron", () => 0.55);
    for (const [cx, cy, r, l] of [
      [12, 12, 6, 0.6],
      [12, 9, 4, 0.85],
      [12, 7, 2, 1],
    ] as const)
      blob(b, cx, cy, r * 0.8, r, "fire", () => l);
    b.outline(OUTLINE);
    return { buf: b, ax: 12, ay: 38 };
  },
};

function field(stage: 0 | 1 | 2): PropSprite {
  const b = new PixBuf(56, 28);
  blob(b, 28, 14, 27, 13, "dirt", (x, y) => 0.55 + (y % 6 < 2 ? -0.3 : 0.05) + (hash2(x, y, 7) - 0.5) * 0.15);
  if (stage)
    for (let row = 5; row < 26; row += 6)
      for (let x = 8; x < 50; x += 7) {
        const dx = (x - 28) / 27,
          dy = (row - 14) / 13;
        if (dx * dx + dy * dy > 0.8) continue;
        if (stage === 1) {
          b.set(x, row - 1, at("leaf", 4));
          b.set(x - 1, row - 2, at("leaf", 3));
          b.set(x + 1, row - 2, at("leaf", 4));
        } else blob(b, x, row - 2, 3, 2.5, "leaf", (xx, yy) => 0.9 - (xx - x + 3) / 10 - (yy - row + 4) / 12);
      }
  return { buf: b, ax: 28, ay: 14 };
}

const cache = new Map<PropKind, PropSprite>();
export function propSprite(k: PropKind): PropSprite {
  let s = cache.get(k);
  if (!s) {
    s = DRAW[k]();
    cache.set(k, s);
  }
  return s;
}
