// Small pixel props that explain a motion: a tree to chop, a well to draw from, water to
// swim in. Each is drawn once into a PixBuf with the village ramps and a dark outline.
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { RAMPS, OUTLINE } from "#/world/scene/pix"
import { type RGB } from "#/lib/graphics/pixel-types"
import { hash2 } from "#/lib/engine/hash2"

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
  | "brazier"

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
}
/** Distance in front, in tiles (props further away read as ranged targets). */
export const PROP_DIST: Partial<Record<PropKind, number>> = { target: 3, dummy: 1, hurdle: 1 }

export type PropSprite = {
  buf: PixBuf
  ax: number
  ay: number
}

type Shade = (x: number, y: number) => number // 0..1 brightness

function blob(inputProps: { b: PixBuf; cx: number; cy: number; rx: number; ry: number; ramp: string; shade?: Shade }) {
  const b = inputProps.b
  const cx = inputProps.cx
  const cy = inputProps.cy
  const rx = inputProps.rx
  const ry = inputProps.ry
  const ramp = inputProps.ramp
  const shade = inputProps.shade

  for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x - cx) / rx,
        dy = (y - cy) / ry
      if (dx * dx + dy * dy > 1) continue
      const l = shade ? shade(x, y) : 0.75 - dx * 0.25 - dy * 0.3
      b.set({ x: x, y: y, color: pick({ ramp: ramp, b: l, x: x, y: y }) })
    }
}
function box(inputProps: { b: PixBuf; x0: number; y0: number; w: number; h: number; ramp: string; shade?: Shade }) {
  const b = inputProps.b
  const x0 = inputProps.x0
  const y0 = inputProps.y0
  const w = inputProps.w
  const h = inputProps.h
  const ramp = inputProps.ramp
  const shade = inputProps.shade

  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const l = shade ? shade(x, y) : 0.7 - ((x - x0) / Math.max(1, w)) * 0.3
      b.set({ x: x, y: y, color: pick({ ramp: ramp, b: l, x: x, y: y }) })
    }
}
const at = (ramp: string, i: number): RGB => RAMPS[ramp][Math.min(RAMPS[ramp].length - 1, i)]

const DRAW: Record<PropKind, () => PropSprite> = {
  tree() {
    const b = new PixBuf(48, 76)
    box({ b: b, x0: 20, y0: 44, w: 8, h: 30, ramp: "wood", shade: (x) => 0.75 - (x - 20) / 10 })
    for (let x = 16; x < 32; x++) b.set({ x: x, y: 74, color: at("wood", 1) })
    for (const entry of [
      [24, 26, 18],
      [14, 34, 11],
      [34, 34, 11],
      [24, 14, 12],
    ] as const) {
      const cx = entry[0]
      const cy = entry[1]
      const r = entry[2]
      blob({ b: b, cx: cx, cy: cy, rx: r, ry: r * 0.9, ramp: "leaf", shade: (x, y) => 0.95 - (x - 10) / 60 - (y - 4) / 50 + (hash2(x >> 1, y >> 1) - 0.5) * 0.2 })
    }
    b.outline(OUTLINE)
    return { buf: b, ax: 24, ay: 74 }
  },
  field() {
    return field(0)
  },
  sprouts() {
    return field(1)
  },
  crops() {
    return field(2)
  },
  well() {
    const b = new PixBuf(40, 50)
    box({ b: b, x0: 4, y0: 26, w: 32, h: 20, ramp: "stone", shade: (x, y) => 0.8 - (x - 4) / 50 + ((y - 26) % 5 === 0 ? -0.25 : 0) + ((x + (((y - 26) / 5) | 0) * 4) % 8 === 0 ? -0.2 : 0) })
    blob({ b: b, cx: 20, cy: 26, rx: 16, ry: 5, ramp: "stone", shade: () => 0.85 })
    blob({ b: b, cx: 20, cy: 26, rx: 12, ry: 3.5, ramp: "water", shade: (x) => 0.35 + (x - 8) / 60 })
    box({ b: b, x0: 5, y0: 4, w: 3, h: 23, ramp: "wood" })
    box({ b: b, x0: 32, y0: 4, w: 3, h: 23, ramp: "wood" })
    box({ b: b, x0: 3, y0: 2, w: 34, h: 4, ramp: "timber", shade: () => 0.8 })
    for (let y = 6; y < 18; y++) b.set({ x: 20, y: y, color: at("wood", 1) })
    box({ b: b, x0: 17, y0: 17, w: 7, h: 6, ramp: "wood", shade: () => 0.65 })
    b.outline(OUTLINE)
    return { buf: b, ax: 20, ay: 46 }
  },
  tub() {
    const b = new PixBuf(34, 20)
    box({ b: b, x0: 3, y0: 6, w: 28, h: 12, ramp: "wood", shade: (x, y) => 0.75 - (x - 3) / 50 + ((x - 3) % 6 === 0 ? -0.3 : 0) + (y === 9 || y === 15 ? -0.4 : 0) })
    blob({ b: b, cx: 17, cy: 6, rx: 14, ry: 4, ramp: "wood", shade: () => 0.85 })
    blob({ b: b, cx: 17, cy: 6, rx: 12, ry: 3, ramp: "water", shade: () => 0.7 })
    blob({ b: b, cx: 13, cy: 6, rx: 5, ry: 2, ramp: "cLinen", shade: () => 0.9 })
    b.outline(OUTLINE)
    return { buf: b, ax: 17, ay: 18 }
  },
  table() {
    const b = new PixBuf(40, 30)
    box({ b: b, x0: 2, y0: 8, w: 36, h: 6, ramp: "wood", shade: () => 0.85 })
    box({ b: b, x0: 2, y0: 14, w: 36, h: 2, ramp: "wood", shade: () => 0.4 })
    box({ b: b, x0: 4, y0: 16, w: 3, h: 12, ramp: "wood", shade: () => 0.5 })
    box({ b: b, x0: 33, y0: 16, w: 3, h: 12, ramp: "wood", shade: () => 0.5 })
    blob({ b: b, cx: 14, cy: 7, rx: 6, ry: 3.5, ramp: "thatch", shade: () => 0.85 })
    blob({ b: b, cx: 27, cy: 7, rx: 4, ry: 3, ramp: "cLinen", shade: () => 0.9 })
    blob({ b: b, cx: 27, cy: 5, rx: 3, ry: 1.5, ramp: "cWine", shade: () => 0.6 })
    b.outline(OUTLINE)
    return { buf: b, ax: 20, ay: 28 }
  },
  chest() {
    const b = new PixBuf(30, 24)
    box({ b: b, x0: 3, y0: 10, w: 24, h: 12, ramp: "wood", shade: (x) => 0.75 - (x - 3) / 40 })
    blob({ b: b, cx: 15, cy: 10, rx: 12, ry: 6, ramp: "wood", shade: (x, y) => 0.95 - (x - 3) / 40 - (y - 4) / 30 })
    box({ b: b, x0: 3, y0: 10, w: 24, h: 2, ramp: "gold", shade: () => 0.7 })
    box({ b: b, x0: 13, y0: 10, w: 4, h: 12, ramp: "gold", shade: () => 0.6 })
    box({ b: b, x0: 14, y0: 13, w: 2, h: 3, ramp: "iron", shade: () => 0.2 })
    b.outline(OUTLINE)
    return { buf: b, ax: 15, ay: 22 }
  },
  bench() {
    const b = new PixBuf(44, 20)
    box({ b: b, x0: 2, y0: 4, w: 40, h: 5, ramp: "wood", shade: () => 0.85 })
    box({ b: b, x0: 2, y0: 9, w: 40, h: 2, ramp: "wood", shade: () => 0.4 })
    box({ b: b, x0: 5, y0: 11, w: 3, h: 8, ramp: "wood", shade: () => 0.5 })
    box({ b: b, x0: 36, y0: 11, w: 3, h: 8, ramp: "wood", shade: () => 0.5 })
    b.outline(OUTLINE)
    return { buf: b, ax: 22, ay: 16 }
  },
  mat() {
    const b = new PixBuf(52, 16)
    blob({ b: b, cx: 26, cy: 8, rx: 24, ry: 6, ramp: "thatch", shade: (x, y) => 0.7 + (((x + y) & 3) === 0 ? -0.2 : 0) })
    blob({ b: b, cx: 10, cy: 7, rx: 7, ry: 3, ramp: "cLinen", shade: () => 0.9 })
    b.outline(OUTLINE)
    return { buf: b, ax: 26, ay: 8 }
  },
  fence() {
    const b = new PixBuf(52, 30)
    for (const x of [4, 24, 44]) box({ b: b, x0: x, y0: 2, w: 4, h: 26, ramp: "wood", shade: (xx) => 0.8 - (xx - x) / 8 })
    box({ b: b, x0: 2, y0: 8, w: 48, h: 3, ramp: "wood", shade: () => 0.75 })
    box({ b: b, x0: 2, y0: 18, w: 48, h: 3, ramp: "wood", shade: () => 0.6 })
    b.outline(OUTLINE)
    return { buf: b, ax: 26, ay: 28 }
  },
  pond() {
    const b = new PixBuf(80, 34)
    blob({ b: b, cx: 40, cy: 17, rx: 39, ry: 16, ramp: "stone", shade: () => 0.6 })
    blob({ b: b, cx: 40, cy: 17, rx: 36, ry: 14, ramp: "water", shade: (x, y) => 0.45 + (y - 3) / 60 + ((x + y * 3) % 11 === 0 ? 0.35 : 0) })
    return { buf: b, ax: 40, ay: 17 }
  },
  wall() {
    const b = new PixBuf(48, 30)
    box({ b: b, x0: 2, y0: 4, w: 44, h: 24, ramp: "stone", shade: (x, y) => 0.75 - (x - 2) / 80 + ((y - 4) % 6 === 0 ? -0.3 : 0) + ((x + (((y - 4) / 6) | 0) * 5) % 10 === 0 ? -0.25 : 0) })
    box({ b: b, x0: 2, y0: 2, w: 44, h: 3, ramp: "stone", shade: () => 0.95 })
    b.outline(OUTLINE)
    return { buf: b, ax: 24, ay: 28 }
  },
  crate() {
    const b = new PixBuf(28, 28)
    box({
      b: b,
      x0: 2,
      y0: 4,
      w: 24,
      h: 22,
      ramp: "wood",
      shade: (x, y) => 0.75 - (x - 2) / 40 + (x === 3 || x === 24 || y === 5 || y === 24 ? -0.35 : 0) + (Math.abs(x - 2 - (y - 4)) < 1.5 ? -0.25 : 0),
    })
    box({ b: b, x0: 2, y0: 2, w: 24, h: 3, ramp: "wood", shade: () => 0.95 })
    b.outline(OUTLINE)
    return { buf: b, ax: 14, ay: 26 }
  },
  cart() {
    const b = new PixBuf(56, 38)
    box({ b: b, x0: 6, y0: 8, w: 44, h: 16, ramp: "wood", shade: (x, y) => 0.75 - (y - 8) / 40 + ((y - 8) % 5 === 0 ? -0.3 : 0) })
    blob({ b: b, cx: 14, cy: 27, rx: 9, ry: 9, ramp: "wood", shade: (x, y) => (Math.hypot(x - 14, y - 27) > 6.5 || x === 14 || y === 27 ? 0.35 : 0) })
    blob({ b: b, cx: 42, cy: 27, rx: 9, ry: 9, ramp: "wood", shade: (x, y) => (Math.hypot(x - 42, y - 27) > 6.5 || x === 42 || y === 27 ? 0.35 : 0) })
    for (let x = 0; x < 8; x++) b.set({ x: x, y: 14, color: at("wood", 2) })
    blob({ b: b, cx: 28, cy: 6, rx: 12, ry: 4, ramp: "thatch", shade: () => 0.85 })
    b.outline(OUTLINE)
    return { buf: b, ax: 28, ay: 36 }
  },
  dummy() {
    const b = new PixBuf(28, 54)
    box({ b: b, x0: 13, y0: 20, w: 3, h: 33, ramp: "wood", shade: () => 0.5 })
    box({ b: b, x0: 3, y0: 22, w: 22, h: 3, ramp: "wood", shade: () => 0.6 })
    blob({ b: b, cx: 14, cy: 32, rx: 8, ry: 12, ramp: "thatch", shade: (x, y) => 0.85 - (x - 6) / 30 + (y % 4 === 0 ? -0.2 : 0) })
    blob({ b: b, cx: 14, cy: 12, rx: 7, ry: 7, ramp: "cLinen", shade: (x, y) => 0.95 - (x - 7) / 25 - (y - 5) / 30 })
    b.set({ x: 12, y: 11, color: OUTLINE })
    b.set({ x: 16, y: 11, color: OUTLINE })
    b.outline(OUTLINE)
    return { buf: b, ax: 14, ay: 52 }
  },
  target() {
    const b = new PixBuf(30, 44)
    box({ b: b, x0: 7, y0: 22, w: 3, h: 20, ramp: "wood", shade: () => 0.5 })
    box({ b: b, x0: 20, y0: 22, w: 3, h: 20, ramp: "wood", shade: () => 0.5 })
    for (const entry2 of [
      [13, "cLinen"],
      [10, "cRed"],
      [7, "cLinen"],
      [4, "cRed"],
    ] as const) {
      const r = entry2[0]
      const ramp = entry2[1]
      blob({ b: b, cx: 15, cy: 16, rx: r, ry: r, ramp: ramp, shade: () => 0.85 })
    }
    b.outline(OUTLINE)
    return { buf: b, ax: 15, ay: 42 }
  },
  grave() {
    const b = new PixBuf(26, 34)
    box({ b: b, x0: 5, y0: 10, w: 16, h: 20, ramp: "stone", shade: (x) => 0.8 - (x - 5) / 30 })
    blob({ b: b, cx: 13, cy: 10, rx: 8, ry: 7, ramp: "stone", shade: (x) => 0.85 - (x - 5) / 30 })
    box({ b: b, x0: 12, y0: 9, w: 2, h: 10, ramp: "stone", shade: () => 0.3 })
    box({ b: b, x0: 9, y0: 12, w: 8, h: 2, ramp: "stone", shade: () => 0.3 })
    blob({ b: b, cx: 13, cy: 31, rx: 12, ry: 3, ramp: "mud", shade: () => 0.5 })
    b.outline(OUTLINE)
    return { buf: b, ax: 13, ay: 31 }
  },
  bush() {
    const b = new PixBuf(40, 26)
    for (const entry3 of [
      [12, 15, 9],
      [27, 15, 10],
      [20, 10, 9],
    ] as const) {
      const cx = entry3[0]
      const cy = entry3[1]
      const r = entry3[2]
      blob({ b: b, cx: cx, cy: cy, rx: r, ry: r * 0.85, ramp: "leaf2", shade: (x, y) => 0.9 - (x - 3) / 60 - (y - 2) / 30 + (hash2(x >> 1, y >> 1, 3) - 0.5) * 0.25 })
    }
    b.outline(OUTLINE)
    return { buf: b, ax: 20, ay: 24 }
  },
  hurdle() {
    const b = new PixBuf(40, 20)
    box({ b: b, x0: 4, y0: 2, w: 3, h: 17, ramp: "wood", shade: () => 0.5 })
    box({ b: b, x0: 33, y0: 2, w: 3, h: 17, ramp: "wood", shade: () => 0.5 })
    box({ b: b, x0: 2, y0: 3, w: 36, h: 3, ramp: "cRed", shade: () => 0.8 })
    box({ b: b, x0: 2, y0: 10, w: 36, h: 2, ramp: "cLinen", shade: () => 0.8 })
    b.outline(OUTLINE)
    return { buf: b, ax: 20, ay: 19 }
  },
  lamppost() {
    const b = new PixBuf(20, 70)
    box({ b: b, x0: 9, y0: 14, w: 3, h: 54, ramp: "iron", shade: () => 0.4 })
    box({ b: b, x0: 5, y0: 66, w: 11, h: 3, ramp: "iron", shade: () => 0.3 })
    box({ b: b, x0: 5, y0: 4, w: 11, h: 12, ramp: "glass", shade: () => 0.4 })
    box({ b: b, x0: 7, y0: 6, w: 7, h: 8, ramp: "fire", shade: () => 0.85 })
    box({ b: b, x0: 4, y0: 2, w: 13, h: 3, ramp: "iron", shade: () => 0.5 })
    b.outline(OUTLINE)
    return { buf: b, ax: 10, ay: 68 }
  },
  brazier() {
    const b = new PixBuf(24, 40)
    box({ b: b, x0: 10, y0: 18, w: 4, h: 20, ramp: "iron", shade: () => 0.4 })
    blob({ b: b, cx: 12, cy: 18, rx: 9, ry: 4, ramp: "iron", shade: () => 0.55 })
    for (const entry4 of [
      [12, 12, 6, 0.6],
      [12, 9, 4, 0.85],
      [12, 7, 2, 1],
    ] as const) {
      const cx = entry4[0]
      const cy = entry4[1]
      const r = entry4[2]
      const l = entry4[3]
      blob({ b: b, cx: cx, cy: cy, rx: r * 0.8, ry: r, ramp: "fire", shade: () => l })
    }
    b.outline(OUTLINE)
    return { buf: b, ax: 12, ay: 38 }
  },
}

function field(stage: 0 | 1 | 2): PropSprite {
  const b = new PixBuf(56, 28)
  blob({ b: b, cx: 28, cy: 14, rx: 27, ry: 13, ramp: "dirt", shade: (x, y) => 0.55 + (y % 6 < 2 ? -0.3 : 0.05) + (hash2(x, y, 7) - 0.5) * 0.15 })
  if (stage)
    for (let row = 5; row < 26; row += 6)
      for (let x = 8; x < 50; x += 7) {
        const dx = (x - 28) / 27,
          dy = (row - 14) / 13
        if (dx * dx + dy * dy > 0.8) continue
        if (stage === 1) {
          b.set({ x: x, y: row - 1, color: at("leaf", 4) })
          b.set({ x: x - 1, y: row - 2, color: at("leaf", 3) })
          b.set({ x: x + 1, y: row - 2, color: at("leaf", 4) })
        } else blob({ b: b, cx: x, cy: row - 2, rx: 3, ry: 2.5, ramp: "leaf", shade: (xx, yy) => 0.9 - (xx - x + 3) / 10 - (yy - row + 4) / 12 })
      }
  return { buf: b, ax: 28, ay: 14 }
}

const cache = new Map<PropKind, PropSprite>()
export function propSprite(k: PropKind): PropSprite {
  let s = cache.get(k)
  if (!s) {
    s = DRAW[k]()
    cache.set(k, s)
  }
  return s
}
