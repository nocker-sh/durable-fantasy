import { PixBuf, pick, hash2, vnoise, RAMPS, type RGB, Rng, hex, bayer } from "../pix"
import { lvl, PPU, S } from "./palette.ts"
import { boardWall } from "./wood.ts"

export interface WallOpts {
  w: number
  h: number
  floors: number
  timber: boolean
  seed: number
  door?: number // u position (units) of door centre
  windows?: boolean
  shutter?: string
  flowers?: boolean
  ramp?: string
  sign?: string
  opening?: boolean // open-front workshop
  /** what the wall is built of (town/style.ts): plaster (timber-framed when `timber`), laid stone, boards */
  material?: "plaster" | "stone" | "board"
  /** leaded diamond panes, four square panes, or a small shuttered window */
  windowKind?: "leaded" | "square" | "small"
  /** a plain plank door, an arched one, or a double door */
  doorKind?: "plank" | "arched" | "double"
}

/** A laid-stone wall: blocks of uneven size and tone, dark mortar, damp and moss along the foot. */
function stoneWall(x: number, y: number, H: number, seed: number): RGB {
  const v = H - 1 - y
  const row = Math.floor(y / 9),
    bw = 14 + Math.floor(hash2(row, 0, seed) * 6)
  const u = x / bw + (row % 2) * 0.5 + hash2(row, 1, seed) * 0.3,
    c = Math.floor(u),
    fu = u - c,
    fv = y / 9 - row
  if (fu < 0.07 || fv > 0.86) return v < 10 && hash2(x, y, seed + 3) > 0.55 ? lvl("moss", 2) : lvl("stone", 0)
  let l = 2 + (hash2(c, row, seed) > 0.7 ? 1 : hash2(c, row, seed) < 0.18 ? -1 : 0)
  if (fv < 0.18) l += 1
  else if (fv > 0.7) l -= 1
  if (v < 14 && bayer(x, y) + 0.47 < (14 - v) / 20) l -= 1 // damp rising from the ground
  if (hash2(x, y, seed + 5) > 0.94) l -= 1
  if (v < 8 && hash2(x >> 1, y >> 1, seed + 6) > 0.8) return lvl("moss", 2 + (hash2(x, y, 7) > 0.5 ? 1 : 0))
  return lvl("stone", l)
}

/** One wall face of a house (u along wall, v up). */
export function wallTex(o: WallOpts): [PixBuf, PixBuf | null] {
  const W = Math.max(8, Math.round(o.w * PPU)),
    H = Math.max(8, Math.round(o.h * PPU))
  const b = new PixBuf(W, H)
  const glow = new PixBuf(W, H)
  glow.fill(() => [0, 0, 0])
  let anyLit = false
  const ramp = o.ramp ?? "plaster"
  const rng = new Rng(o.seed * 31 + 7)
  const fh = H / o.floors
  const T = 3 * S // timber thickness
  // plaster as pixel art: two flat tones in broad patches with a dither between, grime rising from
  // the ground and a shadow under the eaves in dithered steps, rain streaks as single dark lines,
  // and a hairline crack here and there; no per-pixel noise
  const n = RAMPS[ramp].length,
    top = Math.round(0.66 * (n - 1))
  const material = o.material ?? "plaster"
  if (material !== "plaster") b.fill((x, y) => (material === "stone" ? stoneWall(x, y, H, o.seed) : boardWall(x, y, H, o.seed)))
  else
    b.fill((x, y) => {
      const v = H - 1 - y
      const p = vnoise(x, y, 0.06, o.seed)
      let l = p > 0.62 || (p > 0.56 && bayer(x, y) + 0.47 < (p - 0.56) / 0.06) ? top - 1 : top
      // grime at the foot and shadow under the eaves, each fading in over a few pixels
      const grime = Math.max(0, (12 - v) / 12),
        eave = Math.max(0, (v - (H - 10)) / 10)
      if (bayer(x, y) + 0.47 < grime * 1.2) l -= 1
      if (bayer(x, y) + 0.47 < eave * 1.4) l -= 1
      // grit in the plaster, and damp stains in soft patches
      if (hash2(x, y, o.seed + 9) > 0.95) l -= 1
      if (vnoise(x, y, 0.12, o.seed + 10) > 0.72 && bayer(x, y) + 0.47 < 0.5) l -= 1
      // rain streaks running down from the top, a pixel wide
      if (hash2(x, 0, o.seed + 2) > 0.96 && v > H * 0.35 && hash2(x, y >> 3, o.seed + 3) > 0.25) l -= 1
      // hairline cracks: a short stepped line
      const cx = Math.floor(x / 23),
        cy = Math.floor(y / 19)
      if (hash2(cx, cy, o.seed + 6) > 0.86) {
        const lx = x - cx * 23 - 6,
          ly = y - cy * 19 - 4
        if (lx >= 0 && lx < 7 && ly === Math.floor(lx * 0.7) + (hash2(cx, cy, o.seed + 7) > 0.5 ? 0 : lx >> 2)) return lvl(ramp, top - 2)
      }
      return lvl(ramp, l)
    })
  if (ramp === "plaster" && material === "plaster") {
    for (let n = 0; n < 2; n++) {
      const pw = 18 + rng.int(10),
        ph = 12 + rng.int(6)
      const px = rng.int(Math.max(1, W - pw)),
        py = rng.int(Math.max(1, H - ph))
      for (let y = py; y < py + ph; y++)
        for (let x = px; x < px + pw; x++) {
          if (hash2(x, y, o.seed) * 0.35 + Math.hypot((x - px - pw / 2) / pw, (y - py - ph / 2) / ph) * 2 > 1.05) continue
          const row = Math.floor(y / 5)
          const f = (x + (row % 2) * 4) % 9 === 0 || y % 5 === 0
          b.set(x, y, pick("stone", f ? 0.2 : 0.5 + hash2(((x + (row % 2) * 4) / 9) | 0, row, 1) * 0.3, x, y))
        }
    }
  }
  // timber: flat tones with grain as short dark runs, and the odd knot
  const timberC = (x: number, y: number, l = 0.5) => lvl("timber", Math.round(l * 4) + (hash2(x >> 3, y, 3) > 0.86 ? -1 : 0) + (hash2(x >> 2, y >> 2, 8) > 0.97 ? -1 : 0))
  const posts: number[] = []
  if (o.timber) {
    const np = Math.max(2, Math.round(o.w / 1.15))
    const sp = (W - T) / np
    for (let k = 0; k <= np; k++) posts.push(Math.round(k * sp))
    const beamRows: number[] = [H - T]
    for (let f = 1; f < o.floors; f++) beamRows.push(Math.round(H - f * fh - T / 2))
    beamRows.push(0)
    for (const by of beamRows) for (let y = by; y < by + T; y++) for (let x = 0; x < W; x++) b.set(x, y, timberC(x, y, y === by ? 0.72 : y === by + T - 1 ? 0.28 : 0.48))
    for (const px of posts) for (let y = 0; y < H; y++) for (let x = px; x < px + T; x++) b.set(x, y, timberC(x, y, x === px ? 0.68 : x === px + T - 1 ? 0.3 : 0.45))
    for (let f = 0; f < o.floors; f++) {
      const y0 = Math.round(H - f * fh - T),
        y1 = Math.round(H - (f + 1) * fh + T)
      for (let k = 0; k < posts.length - 1; k++) {
        if (hash2(k, f, o.seed) < 0.5) continue
        const xa = posts[k] + T,
          xb = posts[k + 1]
        const dir = hash2(k, f, o.seed + 1) > 0.5
        const steps = y0 - y1
        for (let s = 0; s <= steps; s++) {
          const y = y0 - s
          const xx = Math.round(xa + (xb - xa - T) * (dir ? s / steps : 1 - s / steps))
          for (let d = 0; d < T; d++) b.set(xx + d, y, timberC(xx + d, y, d === 0 ? 0.62 : 0.42))
        }
      }
    }
    // wooden pegs
    for (const px of posts)
      for (let f = 0; f <= o.floors; f++) {
        const y = Math.round(H - f * fh) - T + 1
        if (y > 0 && y < H) b.set(px + 2, y + 1, RAMPS.timber[0])
      }
  }
  const kind = o.windowKind ?? "leaded"
  const winW = kind === "small" ? 12 : 18,
    winH = kind === "small" ? 14 : 22
  const shutter = o.shutter ?? rng.pick(["cGreen", "cBlue", "cRed", "wood"])
  const drawWindow = (cx: number, top: number) => {
    const x0 = cx - (winW >> 1)
    const lit = rng.next() < 0.55
    if (lit) anyLit = true
    for (let y = top - 2; y <= top + winH + 1; y++) for (let x = x0 - 2; x <= x0 + winW + 1; x++) b.set(x, y, pick("timber", x < x0 || y < top ? 0.68 : 0.4, x, y))
    for (let y = top; y < top + winH; y++)
      for (let x = x0; x < x0 + winW; x++) {
        // leaded diamond panes, or four square panes, or one small pane
        const dx = (x - x0) % 6,
          dy = (y - top) % 6
        const lead = kind === "leaded" ? dx === dy || dx === 5 - dy : false
        let gl = 0.28 - ((y - top) / winH) * 0.15 + (x - x0 < 6 && y - top < 8 ? 0.45 : 0) + (hash2((x / 6) | 0, (y / 6) | 0, 2) - 0.5) * 0.15
        b.set(x, y, lead ? pick("iron", 0.2, x, y) : pick("glass", gl, x, y))
        if (lit && !lead) glow.set(x, y, pick("fire", 0.55 + ((y - top) / winH) * 0.4 - (Math.abs(x - cx) / winW) * 0.4, x, y))
      }
    for (let y = top; y < top + winH; y++) {
      b.set(cx, y, pick("timber", 0.55, cx, y))
      b.set(cx - 1, y, pick("timber", 0.35, cx, y))
    }
    for (let x = x0; x < x0 + winW; x++) {
      b.set(x, top + 10, pick("timber", 0.55, x, 0))
      b.set(x, top + 11, pick("timber", 0.3, x, 0))
    }
    for (const side of [-1, 1]) {
      const sx0 = side < 0 ? x0 - 12 : x0 + winW + 2
      for (let y = top - 2; y <= top + winH + 1; y++)
        for (let x = sx0; x < sx0 + 10; x++) {
          const k = (x - sx0) % 4
          const z = Math.abs(y - (top + 4)) < 1 || Math.abs(y - (top + winH - 5)) < 1
          const diag = Math.abs(x - sx0 - (y - top - 5) * 0.6) < 1 && y > top + 4 && y < top + winH - 5
          let l = z || diag ? 0.3 : k === 0 ? 0.35 : k === 1 ? 0.68 : 0.55
          l += (vnoise(x, y, 0.3, 5) - 0.5) * 0.15
          b.set(x, y, pick(shutter, l, x, y, 0.3))
        }
      // hinge
      const hx = side < 0 ? x0 - 3 : x0 + winW + 2
      b.set(hx, top + 4, RAMPS.iron[1])
      b.set(hx, top + winH - 5, RAMPS.iron[1])
    }
    for (let x = x0 - 4; x <= x0 + winW + 3; x++) {
      b.set(x, top + winH + 2, pick("stone", 0.78, x, 0))
      b.set(x, top + winH + 3, pick("stone", 0.35, x, 0))
    }
    if (o.flowers && rng.next() < 0.7) {
      for (let x = x0 - 2; x <= x0 + winW + 1; x++) for (let y = top + winH + 4; y < top + winH + 10; y++) b.set(x, y, pick("wood", y === top + winH + 4 ? 0.7 : (x - x0) % 5 === 0 ? 0.3 : 0.5, x, y))
      const fcs = [hex("#c84848"), hex("#e08ab0"), hex("#f0d060"), hex("#f2eee2"), hex("#9a6ac8")]
      const fc = rng.pick(fcs),
        fc2 = rng.pick(fcs)
      for (let x = x0 - 2; x <= x0 + winW + 1; x++) {
        const hgt = 2 + Math.floor(hash2(x, 0, o.seed) * 5)
        for (let k = 0; k < hgt; k++) b.set(x, top + winH + 3 - k, pick("leaf", 0.35 + k * 0.1 + hash2(x, k, 1) * 0.15, x, k))
        if (hash2(x, 1, o.seed) > 0.55) {
          const yy = top + winH + 4 - hgt,
            c = hash2(x, 2, o.seed) > 0.5 ? fc : fc2
          b.set(x, yy, c)
          b.set(x, yy - 1, c)
          if (hash2(x, 3, o.seed) > 0.5) b.set(x + 1, yy, c)
        }
      }
      // trailing ivy below
      for (let x = x0 - 2; x <= x0 + winW + 1; x += 3) {
        const l = Math.floor(hash2(x, 4, o.seed) * 7)
        for (let k = 0; k < l; k++) b.set(x + (k % 2), top + winH + 10 + k, pick("leaf", 0.3 + (k % 2) * 0.2, x, k))
      }
    }
  }
  const doorW = 24,
    doorH = Math.min(44, Math.round(fh) - 8)
  let doorX = -100
  if (o.door !== undefined) {
    doorX = Math.round(o.door * PPU)
    const x0 = doorX - doorW / 2,
      top = H - T - doorH
    for (let y = top - 4; y < H - T; y++)
      for (let x = x0 - 4; x < x0 + doorW + 4; x++) {
        const inner = x >= x0 && x < x0 + doorW && y >= top
        const arch = (o.doorKind ?? "arched") !== "plank" && y - top < 6 && Math.hypot(x - doorX + 0.5, (y - top - 6) * 2) > doorW / 2 + (inner ? 0 : 4)
        if (arch) continue
        if (!inner) {
          const blk = (((x - x0 + 4) / 4) | 0) + (((y - top) / 7) | 0)
          b.set(x, y, pick("stone", (y - top) % 7 === 0 ? 0.25 : 0.45 + hash2(blk, (y / 7) | 0, 4) * 0.35, x, y))
          continue
        }
        const k = (x - x0) % 6
        let l = k === 0 ? 0.25 : k === 1 ? 0.62 : 0.5 - ((y - top) / doorH) * 0.12
        if (o.doorKind === "double" && Math.abs(x - doorX) < 1) l = 0.15 // where the two leaves meet
        l += (vnoise(x * 3, y, 0.2, 7) - 0.5) * 0.12
        const strap = (y - top) % 14 === 8 || (y - top) % 14 === 9
        if (strap && x < x0 + doorW - 4) {
          b.set(x, y, pick("iron", (y - top) % 14 === 8 ? 0.55 : 0.25, x, y))
          continue
        }
        b.set(x, y, pick("wood", l, x, y, 0.3))
      }
    const ky = top + Math.round(doorH * 0.55)
    b.rect(x0 + doorW - 6, ky, 3, 3, RAMPS.iron[1])
    b.set(x0 + doorW - 6, ky, RAMPS.iron[4])
    b.set(x0 + doorW - 5, ky + 4, RAMPS.iron[3])
    b.set(x0 + doorW - 5, ky + 5, RAMPS.iron[2])
    b.set(x0 + doorW - 5, ky + 6, RAMPS.iron[3])
  }
  if (o.opening) {
    const x0 = 6,
      x1 = W - 6,
      top = Math.round(H - fh + 10)
    for (let y = top; y < H - T; y++) for (let x = x0; x < x1; x++) b.set(x, y, pick("timber", 0.06 + ((y - top) / (H - top)) * 0.18 + hash2(x, y, 1) * 0.05, x, y))
    for (let x = x0 - 4; x < x1 + 4; x++) for (let y = top - 6; y < top; y++) b.set(x, y, timberC(x, y, y === top - 6 ? 0.7 : 0.45))
  }
  if (o.windows !== false) {
    for (let f = 0; f < o.floors; f++) {
      const top = Math.round(H - (f + 1) * fh + fh * 0.26)
      const slots: number[] = []
      if (posts.length > 1) for (let k = 0; k < posts.length - 1; k++) slots.push(Math.round((posts[k] + posts[k + 1] + T) / 2))
      else for (let u = 0.9; u < o.w - 0.5; u += 1.5) slots.push(Math.round(u * PPU))
      slots.forEach((cx, k) => {
        if (Math.abs(cx - doorX) < 30 && f === 0) return
        if (o.opening && f === 0) return
        if (hash2(k, f, o.seed + 4) < 0.22) return
        if (cx - winW / 2 - 12 < 0 || cx + winW / 2 + 12 > W) return
        drawWindow(cx, top)
      })
    }
  }
  return [b, anyLit ? glow : null]
}

/** Gable triangle plaster with king post. v=0 bottom. */
export function gableTex(w: number, h: number, timber: boolean, seed: number, ramp = "plaster"): PixBuf {
  const W = Math.max(8, Math.round(w * PPU)),
    H = Math.max(4, Math.round(h * PPU))
  const b = new PixBuf(W, H)
  b.fill((x, y) => {
    const n = RAMPS[ramp].length,
      top = Math.round(0.7 * (n - 1))
    if (timber && (Math.abs(x - W / 2) < 3 || y > H - 6)) return lvl("timber", Math.abs(x - W / 2) < 1 || y === H - 6 ? 3 : 2)
    if (timber && Math.abs(Math.abs(x - W / 2) - (((H - y) * (W / 2)) / H) * 0.5) < 2.4 && y > H * 0.4) return lvl("timber", 2)
    const p = vnoise(x, y, 0.06, seed)
    return lvl(ramp, p > 0.62 || (p > 0.56 && bayer(x, y) + 0.47 < (p - 0.56) / 0.06) ? top - 1 : top)
  })
  // small attic vent
  const cx = W >> 1,
    cy = Math.round(H * 0.55)
  for (let y = cy - 6; y < cy + 6; y++) for (let x = cx - 8; x < cx + 8; x++) if (Math.abs(x - cx + 0.5) > 3 && (x + y) % 4 !== 0) b.set(x, y, pick("glass", 0.15, x, y))
  return b
}
