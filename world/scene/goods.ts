// Market goods and small life details as pixel sprites (64 px per unit).
import { OUTLINE, PixBuf, RAMPS, type RGB, hex, bayer, Rng, hash2 } from "./pix"

export const GPPU = 64

const R = (a: string[]) => a.map(hex)
const FR: Record<string, RGB[]> = {
  apple: R(["#3a1424", "#6e2030", "#a8323a", "#d0543e", "#ec9060"]),
  appleG: R(["#2a3420", "#4a5a28", "#76862e", "#a4b040", "#d4d878"]),
  pear: R(["#3a3420", "#6a6428", "#a29a36", "#cfc254", "#ece08c"]),
  plum: R(["#1e1428", "#3a2244", "#5a3462", "#7c4e80", "#a07aa8"]),
  onion: R(["#4a2a20", "#7a4a2a", "#a8703a", "#cc9a58", "#ead0a0"]),
  turnip: R(["#4a2a44", "#7a4a6c", "#c8a8b8", "#e8dcd8", "#fbf6f0"]),
  cabbage: R(["#1e3428", "#2e4e34", "#4a7040", "#74984e", "#a8c272"]),
  egg: R(["#6a5a4a", "#a0907a", "#cebea4", "#e8dcc4", "#fbf4e4"]),
  bread: R(["#3e2418", "#6a3e22", "#9c6430", "#c88e46", "#e6b66a"]),
  cheese: R(["#5a4020", "#9a7430", "#d0a844", "#ecca6a", "#f8e6a4"]),
  rind: R(["#3e2a1c", "#6a4628", "#94683a"]),
  fish: R(["#262c3a", "#465068", "#727e92", "#a8b2bc", "#e2e8e8"]),
  trout: R(["#2a2a26", "#4a5038", "#7a8250", "#b0a874", "#e8dcb0"]),
  herring: R(["#1e2632", "#34465a", "#5c7488", "#9cb0bc", "#eef2f2"]),
  carrot: R(["#5a2414", "#963c1c", "#cc6224", "#ec8a34", "#f8b464"]),
  grape: R(["#1a1430", "#2e2450", "#4a3a72", "#6c5a94", "#9a8ab8"]),
  clay: R(["#3a2420", "#6a3a2a", "#9a5a3a", "#c07a4c", "#dca070"]),
  jar: R(["#22303a", "#344c56", "#4c6e72", "#6e948a", "#a2bea8"]),
  garlic: R(["#6a5a5a", "#a09090", "#ccc0b8", "#ece4dc", "#fcf8f2"]),
  sausage: R(["#2e1418", "#5a2424", "#843a32", "#a85a42", "#c87e5a"]),
  leafG: R(["#1e2e22", "#2e4a2e", "#46683a", "#68884a", "#94aa62"]),
}

function shade(ramp: RGB[], l: number, x: number, y: number): RGB {
  const n = ramp.length
  const t = Math.min(1, Math.max(0, l)) * (n - 1) + bayer(x, y) * 0.6
  return ramp[Math.min(n - 1, Math.max(0, Math.round(t)))]
}

/** Shaded ellipse lit from the upper left, with a 1px dark rim on the lower right. */
function blob(b: PixBuf, cx: number, cy: number, rx: number, ry: number, ramp: RGB[], spec = true, base = 0.55) {
  for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++)
    for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const nx = (x + 0.5 - cx) / rx,
        ny = (y + 0.5 - cy) / ry
      const d = nx * nx + ny * ny
      if (d > 1) continue
      const nz = Math.sqrt(1 - d)
      let l = base + (-nx * 0.45 - ny * 0.55 + nz * 0.5) * 0.55
      if (d > 0.72 && nx + ny > 0.3) l = 0
      b.set(x, y, shade(ramp, l, x, y))
    }
  if (spec && rx >= 2) b.set(Math.round(cx - rx * 0.4), Math.round(cy - ry * 0.45), ramp[ramp.length - 1])
}

function item(b: PixBuf, kind: string, cx: number, cy: number, rng: Rng) {
  switch (kind) {
    case "apple":
    case "appleG": {
      const r = 3.2 + rng.next() * 0.8
      blob(b, cx, cy, r, r * 0.92, FR[kind])
      b.set(Math.round(cx), Math.round(cy - r), RAMPS.timber[1])
      if (rng.next() < 0.3) b.set(Math.round(cx + 1), Math.round(cy - r - 1), FR.leafG[3])
      if (kind === "apple" && rng.next() < 0.5) b.set(Math.round(cx - 1), Math.round(cy + 1), FR.appleG[3])
      break
    }
    case "pear":
      blob(b, cx, cy + 1, 3.2, 3, FR.pear)
      blob(b, cx - 0.3, cy - 2.2, 2, 2, FR.pear, false)
      b.set(Math.round(cx), Math.round(cy - 5), RAMPS.timber[1])
      break
    case "plum":
      blob(b, cx, cy, 2.6, 2.9, FR.plum)
      break
    case "onion":
      blob(b, cx, cy, 3.4, 3, FR.onion)
      b.set(Math.round(cx), Math.round(cy - 3), FR.onion[1])
      b.set(Math.round(cx), Math.round(cy - 4), FR.onion[3])
      break
    case "turnip":
      blob(b, cx, cy, 3.4, 3.2, FR.turnip)
      for (let x = -3; x <= 3; x++)
        for (let y = -3; y <= -1; y++)
          if (x * x + (y + 1) * 3 < 8 && b.alpha(Math.round(cx + x), Math.round(cy + y))) b.set(Math.round(cx + x), Math.round(cy + y), shade(FR.plum, 0.5 - x * 0.05, x, y))
      b.set(Math.round(cx), Math.round(cy - 4), FR.leafG[3])
      b.set(Math.round(cx - 1), Math.round(cy - 5), FR.leafG[2])
      b.set(Math.round(cx + 1), Math.round(cy - 5), FR.leafG[4])
      break
    case "cabbage": {
      blob(b, cx, cy, 6, 5.2, FR.cabbage, false)
      for (let k = -1; k <= 1; k++) for (let t = 0; t < 5; t++) b.set(Math.round(cx + k * 3 + t * 0.4 * k), Math.round(cy - 3 + t), FR.cabbage[4])
      for (let x = -6; x <= 6; x++) if (Math.abs(x) > 3) b.set(Math.round(cx + x), Math.round(cy - 2 + Math.abs(x) * 0.3), FR.cabbage[1])
      break
    }
    case "egg":
      blob(b, cx, cy, 2.2, 2.8, FR.egg)
      break
    case "grape":
      for (let k = 0; k < 9; k++) {
        const row = k < 4 ? 0 : k < 7 ? 1 : 2,
          col = k < 4 ? k : k < 7 ? k - 4 : k - 7
        blob(b, cx - (3 - row) * 1.4 + col * 2.8 + row * 0.2, cy - 3 + row * 2.6, 1.6, 1.6, FR.grape, true, 0.6)
      }
      b.set(Math.round(cx), Math.round(cy - 5), RAMPS.timber[2])
      b.set(Math.round(cx + 1), Math.round(cy - 6), FR.leafG[3])
      b.set(Math.round(cx + 2), Math.round(cy - 6), FR.leafG[4])
      break
    case "carrot": {
      const ang = (rng.next() - 0.5) * 0.6
      for (let t = 0; t < 11; t++) {
        const w = 2.2 * (1 - t / 13)
        const x = cx + Math.sin(ang) * t,
          y = cy - 4 + Math.cos(ang) * t
        for (let d = -w; d <= w; d += 1) b.set(Math.round(x + d), Math.round(y), shade(FR.carrot, 0.6 - d * 0.15 - (t % 3 === 0 ? 0.15 : 0), Math.round(x + d), Math.round(y)))
      }
      for (let k = -2; k <= 2; k++) for (let t = 1; t < 5; t++) b.set(Math.round(cx + k * 0.8 - Math.sin(ang) * t), Math.round(cy - 4 - t), FR.leafG[2 + ((k + t) & 1)])
      break
    }
    case "bread": {
      blob(b, cx, cy, 7, 3.6, FR.bread, false, 0.62)
      for (let k = -2; k <= 2; k++) for (let t = 0; t < 3; t++) b.set(Math.round(cx + k * 2.6 + t), Math.round(cy - 2 + t * 0.6), FR.bread[k % 2 ? 4 : 1])
      break
    }
    case "roll":
      blob(b, cx, cy, 3.2, 2.6, FR.bread, true, 0.62)
      break
    case "cheese": {
      // wheel seen from the side
      for (let y = -3; y <= 3; y++)
        for (let x = -8; x <= 8; x++) {
          const top = y < -1
          const e = Math.abs(x) / 8.5
          if (e > 1) continue
          b.set(Math.round(cx + x), Math.round(cy + y), top ? shade(FR.cheese, 0.8 - e * 0.2, x, y) : shade(FR.rind, 0.8 - (x + 8) / 18 - (y > 2 ? 0.3 : 0), x, y))
        }
      if (rng.next() < 0.4)
        for (let y = -3; y <= 3; y++) for (let x = 2; x <= 8; x++) if (x - 2 < y + 3) b.set(Math.round(cx + x), Math.round(cy + y), shade(FR.cheese, 0.65 + (hash2(x, y, 1) > 0.85 ? -0.4 : 0), x, y))
      break
    }
    case "fish":
    case "trout":
    case "herring": {
      const ramp = FR[kind]
      for (let x = -9; x <= 9; x++) {
        const w = x > 6 ? (x - 6) * 1.1 : 2.6 * Math.cos((((x + 1) / 12) * Math.PI) / 1.2)
        for (let y = -w; y <= w; y++) {
          const yy = Math.round(cy + y),
            xx = Math.round(cx + x)
          let l = 0.72 - (y / 5) * 0.45 - (Math.abs(y) > w - 1 ? 0.25 : 0)
          if (Math.abs(y) < 0.6 && x < 6) l += 0.12
          b.set(xx, yy, shade(ramp, l, xx, yy))
        }
      }
      b.set(Math.round(cx - 7), Math.round(cy - 1), RAMPS.iron[0])
      b.set(Math.round(cx - 6), Math.round(cy - 1), ramp[4])
      for (let k = 0; k < 3; k++) b.set(Math.round(cx + k - 1), Math.round(cy - 3 - (k === 1 ? 1 : 0)), ramp[1])
      break
    }
    case "jug": {
      const ramp = rng.next() < 0.5 ? FR.clay : FR.jar
      for (let y = -9; y <= 7; y++) {
        const t = (y + 9) / 16
        const w = y < -6 ? 1.8 : 2 + Math.sin(t * Math.PI) * 3.6
        for (let x = -w; x <= w; x++) {
          const xx = Math.round(cx + x),
            yy = Math.round(cy + y)
          b.set(xx, yy, shade(ramp, 0.62 - (x / w) * 0.35 + (y === -9 ? 0.2 : 0) - (y > 5 ? 0.2 : 0), xx, yy))
        }
      }
      for (let y = -7; y <= -1; y++) b.set(Math.round(cx + 5 + (y > -6 && y < -2 ? 1 : 0)), Math.round(cy + y), ramp[1])
      for (let x = -4; x <= 4; x++) b.set(Math.round(cx + x), Math.round(cy - 2), ramp[4])
      break
    }
  }
}

/** One item centred on a size × size canvas with a dark outline, for inventory icons. */
export function goodIcon(kind: string, size = 24, seed = 7): PixBuf {
  const b = new PixBuf(size, size)
  item(b, kind, size / 2 - 0.5, size / 2 + (kind === "carrot" ? 1 : 0), new Rng(seed))
  b.outline(OUTLINE)
  return b
}

/** Heap of items for a crate or basket, w x h px canvas. */
export function heap(kind: string, w: number, h: number, seed: number): PixBuf {
  const b = new PixBuf(w, h)
  const rng = new Rng(seed)
  const sz = kind === "cabbage" ? 10 : kind === "bread" ? 13 : kind === "cheese" ? 16 : kind === "fish" ? 18 : kind === "jug" ? 11 : 6
  const rows = Math.max(1, Math.floor((h - 4) / (sz * 0.72)))
  for (let r = rows - 1; r >= 0; r--) {
    const yc = h - 3 - r * sz * 0.72 - sz / 2
    const span = (w - sz) * (1 - r / (rows + 0.6))
    const n = Math.max(1, Math.round(span / (sz * 0.86)) + 1)
    for (let i = 0; i < n; i++) {
      const xc = w / 2 - span / 2 + (n === 1 ? span / 2 : (i / (n - 1)) * span) + (rng.next() - 0.5) * 1.6
      item(b, kind, xc, yc + (rng.next() - 0.5) * 1.6, rng)
    }
  }
  return b
}

/** Wicker basket with goods heaped on top. */
export function basket(kind: string, seed: number, w = 30, h = 26): PixBuf {
  const b = new PixBuf(w, h)
  const top = heap(kind, w - 4, h - 8, seed)
  b.blit(top, 2, 0)
  const W = RAMPS.thatch
  for (let y = h - 12; y < h; y++)
    for (let x = 1; x < w - 1; x++) {
      const t = (y - (h - 12)) / 12
      const inset = Math.round(t * 2.5)
      if (x < 1 + inset || x >= w - 1 - inset) continue
      const weave = (x + (y >> 1)) % 4 < 2 !== (((y >> 1) & 1) === 0)
      let l = 0.62 - ((x - w / 2) / w) * 0.5 + (weave ? 0.12 : -0.08) - t * 0.15
      if (y === h - 12 || y === h - 11) l = 0.8
      if (y === h - 1) l = 0.1
      b.set(x, y, shade(W, l, x, y))
    }
  return b
}

/** Things hung under awnings: garlic braids, sausages, herb bundles. */
export function hanging(kind: string, seed: number): PixBuf {
  const rng = new Rng(seed)
  const b = new PixBuf(12, 34)
  for (let y = 0; y < 4; y++) b.set(6, y, RAMPS.thatch[2])
  if (kind === "garlic") {
    for (let k = 0; k < 6; k++) blob(b, 6 + (k % 2 ? 2 : -2), 7 + k * 4.2, 3, 2.8, FR.garlic)
  } else if (kind === "sausage") {
    for (let s = -1; s <= 1; s++)
      for (let y = 3; y < 30 - Math.abs(s) * 4; y++) {
        const x = 6 + s * 3 + Math.sin(y * 0.3 + s) * 0.6
        for (let d = -1; d <= 1; d++) b.set(Math.round(x + d), y, shade(FR.sausage, 0.6 - d * 0.25 - ((y + s * 3) % 9 === 0 ? 0.4 : 0), x, y))
      }
  } else {
    for (let k = 0; k < 14; k++) {
      const x0 = 6 + (rng.next() - 0.5) * 3,
        len = 14 + rng.int(10)
      for (let t = 0; t < len; t++) {
        const x = x0 + (k - 7) * t * 0.04
        b.set(Math.round(x), 4 + t, FR.leafG[t < 3 ? 1 : 1 + ((k + t) % 4)])
      }
    }
    for (let x = 4; x < 9; x++) b.set(x, 5, RAMPS.cRed[3])
  }
  return b
}

/** Laundry piece hung on a line. */
export function laundry(kind: number, seed: number): PixBuf {
  const rng = new Rng(seed)
  const ramps = ["cLinen", "cLinen", "cBlue", "cRed", "cMustard", "wool", "cGreen"]
  const ramp = RAMPS[ramps[kind % ramps.length]]
  const shapes = ["sheet", "shirt", "sheet", "apron", "sock"]
  const shape = shapes[(kind + seed) % shapes.length]
  const w = shape === "sheet" ? 44 : shape === "sock" ? 8 : 26,
    h = shape === "sheet" ? 40 : shape === "sock" ? 14 : 28
  const b = new PixBuf(w, h)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (shape === "shirt") {
        const body = x > 6 && x < w - 7
        const sleeve = y < 12 && (x <= 6 || x >= w - 7) && y > (x <= 6 ? 6 - x : x - (w - 7)) * 0.4
        if (!body && !sleeve) continue
        if (body && y > h - 1 - (hash2(x >> 2, 0, seed) > 0.5 ? 1 : 0)) continue
      }
      if (shape === "apron" && (x < 3 + y * 0.12 || x > w - 4 - y * 0.12)) continue
      if (shape === "sock" && x > 4 && y < h - 5) continue
      const fold = Math.sin(x * 0.45 + rng.next() * 0.2) * 0.12 + Math.sin(x * 0.13 + seed) * 0.1
      let l = 0.66 + fold - (y / h) * 0.12
      if (y < 2) l += 0.1
      if (hash2(x, y, seed) > 0.985) l -= 0.3
      b.set(x, y, shade(ramp, l, x, y))
    }
  // pegs
  for (const px of [2, w - 3]) {
    b.set(px, 0, RAMPS.wood[3])
    b.set(px, 1, RAMPS.wood[2])
    b.set(px, 2, RAMPS.wood[1])
  }
  return b
}

/** Sprite frames for a cat: sit, walk1, walk2, wash. Side view facing right. */
export function catFrames(seed: number): PixBuf[] {
  const furs = [
    ["#1e1a22", "#2e2832", "#423a44", "#5a5058"],
    ["#3e2418", "#7a4a2a", "#b07038", "#d89c58"],
    ["#5a5458", "#8a8484", "#c4beb4", "#ece8de"],
  ]
  const fur = R(furs[seed % furs.length])
  const frames: PixBuf[] = []
  for (let f = 0; f < 4; f++) {
    const b = new PixBuf(28, 22)
    const sit = f === 0 || f === 3
    const set = (x: number, y: number, l: number) => b.set(x, y, shade(fur, l, x, y))
    if (sit) {
      for (let y = 9; y < 21; y++) for (let x = 7; x < 19; x++) if (Math.hypot((x - 13) / 6, (y - 15) / 6.5) < 1) set(x, y, 0.75 - (x - 7) / 14 - (y - 9) / 30)
      for (let y = 3; y < 11; y++) for (let x = 12; x < 22; x++) if (Math.hypot((x - 17) / 4.6, (y - 7.5) / 4) < 1) set(x, y, 0.85 - (x - 12) / 14)
      set(13, 2, 0.6)
      set(14, 2, 0.5)
      set(13, 3, 0.6)
      set(20, 2, 0.4)
      set(21, 2, 0.3)
      set(20, 3, 0.4)
      for (let k = 0; k < 9; k++) {
        set(6 - Math.round(Math.sin(k / 3) * 2), (20 - k * 0.2) | 0, 0.3)
        set(Math.max(0, 6 - k), 20, 0.25)
      }
      if (f === 0) {
        b.set(16, 7, R(["#c8b040"])[0])
        b.set(19, 7, R(["#c8b040"])[0])
      } else {
        b.set(16, 7, fur[0])
        b.set(19, 7, fur[0])
        for (let y = 10; y < 13; y++) set(20, y, 0.6)
      }
    } else {
      const ph = f === 1 ? 1 : -1
      for (let y = 8; y < 15; y++) for (let x = 5; x < 20; x++) if (Math.hypot((x - 12.5) / 7.5, (y - 11.5) / 3.6) < 1) set(x, y, 0.8 - (y - 8) / 9)
      for (let y = 4; y < 12; y++) for (let x = 17; x < 26; x++) if (Math.hypot((x - 21.5) / 4.4, (y - 8) / 3.6) < 1) set(x, y, 0.85 - (y - 4) / 12)
      set(19, 3, 0.6)
      set(19, 4, 0.6)
      set(24, 3, 0.4)
      set(24, 4, 0.4)
      b.set(22, 7, R(["#c8b040"])[0])
      b.set(25, 7, fur[0])
      for (const [lx, o] of [
        [7, ph],
        [10, -ph],
        [15, -ph],
        [18, ph],
      ])
        for (let y = 14; y < 20; y++) set(lx + (y > 16 ? o : 0), y, 0.35)
      for (let k = 0; k < 8; k++) set(5 - k, 9 - Math.round(Math.sin(k / 2.5) * 4), 0.45)
    }
    b.outline(R(["#18121c"])[0])
    frames.push(b)
  }
  return frames
}

/** Hen frames: stand, walk, peck1, peck2. Side view facing right. */
export function henFrames(seed: number): PixBuf[] {
  const brown = seed % 3 !== 0
  const body = brown ? RAMPS.henB : RAMPS.hen
  const out: PixBuf[] = []
  for (let f = 0; f < 4; f++) {
    const b = new PixBuf(20, 20)
    const peck = f >= 2 ? (f === 2 ? 3 : 5) : 0
    for (let y = 6; y < 15; y++)
      for (let x = 3; x < 15; x++) {
        const d = Math.hypot((x - 9) / 6, (y - 10.5) / 4.4)
        if (d > 1) continue
        let l = 0.75 - (y - 6) / 10 - (x - 3) / 40
        if ((x + y) % 5 === 0 && y > 9) l -= 0.25
        b.set(x, y, shade(body, l, x, y))
      }
    for (let y = 3; y < 9; y++) for (let x = 1; x < 6; x++) if (x - 1 < 9 - y) b.set(x, y, shade(body, 0.4 + (x === 1 ? -0.2 : 0), x, y)) // tail
    const hx = 14 + Math.round(peck * 0.4),
      hy = 6 + peck
    for (let y = hy - 2; y < hy + 3; y++) for (let x = hx - 2; x < hx + 3; x++) if (Math.hypot(x - hx, y - hy) < 2.6) b.set(x, y, shade(body, 0.8, x, y))
    b.set(hx, hy - 3, RAMPS.comb[1])
    b.set(hx + 1, hy - 3, RAMPS.comb[2])
    b.set(hx - 1, hy - 2, RAMPS.comb[1])
    // eyes only: no beak or wattle drawn on the creatures (ui.md §6.4.2)
    b.set(hx + 1, hy - 1, RAMPS.iron[0])
    const step = f === 1 ? 1 : 0
    for (let y = 15; y < 19; y++) {
      b.set(8 - step, y, RAMPS.beak[1])
      b.set(11 + step, y, RAMPS.beak[1])
    }
    b.set(9 - step, 18, RAMPS.beak[1])
    b.set(12 + step, 18, RAMPS.beak[1])
    b.outline(hex("#1c1418"))
    out.push(b)
  }
  return out
}

/** Scattered life clutter on the ground: straw, leaves, broken pot, bones, wood chips. */
export function clutter(kind: string, seed: number): PixBuf {
  const rng = new Rng(seed)
  const b = new PixBuf(24, 10)
  if (kind === "straw")
    for (let k = 0; k < 18; k++) {
      const x = rng.int(20) + 2,
        y = 4 + rng.int(6),
        l = 2 + rng.int(4),
        d = rng.next() < 0.5 ? 1 : -1
      for (let t = 0; t < l; t++) b.set(x + t * d, y - (t >> 1), RAMPS.thatch[2 + rng.int(4)])
    }
  if (kind === "chips")
    for (let k = 0; k < 14; k++) {
      const x = rng.int(22) + 1,
        y = 5 + rng.int(5)
      b.set(x, y, RAMPS.wood[3 + rng.int(2)])
      b.set(x + 1, y, RAMPS.wood[2])
    }
  if (kind === "shards")
    for (let k = 0; k < 6; k++) {
      const x = rng.int(18) + 3,
        y = 4 + rng.int(5)
      b.set(x, y, FR.clay[3])
      b.set(x + 1, y, FR.clay[2])
      b.set(x, y + 1, FR.clay[1])
    }
  if (kind === "leaves")
    for (let k = 0; k < 10; k++) {
      const x = rng.int(20) + 2,
        y = 4 + rng.int(6)
      const c = rng.pick([RAMPS.autumn[2], RAMPS.autumn[3], RAMPS.autumn[4], RAMPS.leaf[3]])
      b.set(x, y, c)
      b.set(x + 1, y, c)
      b.set(x, y - 1, c)
    }
  return b
}
