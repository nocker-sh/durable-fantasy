import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { RAMPS } from "#/world/scene/pix"
import { bayer } from "#/world/scene/bayer"
import { Rng } from "#/lib/engine/random"
import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"
import { lvl, PPU, S } from "#/world/scene/textures/palette"
import { boardWall } from "#/world/scene/textures/board-wall"
import type { WallOpts } from "#/world/scene/textures/walls"
import { stoneWall } from "#/world/scene/textures/stone-wall"

/** One wall face of a house (u along wall, v up). */
export function wallTex(o: WallOpts): [PixBuf, PixBuf | null] {
  const W = Math.max(8, Math.round(o.w * PPU)),
    H = Math.max(8, Math.round(o.h * PPU))
  const b = new PixBuf(W, H)
  const glow = new PixBuf(W, H)
  glow.fill(() => [0, 0, 0])
  const anyLit = { value: false }
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
  if (material !== "plaster") b.fill((x, y) => (material === "stone" ? stoneWall({ x: x, y: y, H: H, seed: o.seed }) : boardWall({ x: x, y: y, H: H, seed: o.seed })))
  else
    b.fill((x, y) => {
      const v = H - 1 - y
      const p = vnoise({ x: x, y: y, scale: 0.06, seed: o.seed })
      const l = { value: p > 0.62 || (p > 0.56 && bayer(x, y) + 0.47 < (p - 0.56) / 0.06) ? top - 1 : top }
      // grime at the foot and shadow under the eaves, each fading in over a few pixels
      const grime = Math.max(0, (12 - v) / 12),
        eave = Math.max(0, (v - (H - 10)) / 10)
      if (bayer(x, y) + 0.47 < grime * 1.2) l.value -= 1
      if (bayer(x, y) + 0.47 < eave * 1.4) l.value -= 1
      // grit in the plaster, and damp stains in soft patches
      if (hash2(x, y, o.seed + 9) > 0.95) l.value -= 1
      if (vnoise({ x: x, y: y, scale: 0.12, seed: o.seed + 10 }) > 0.72 && bayer(x, y) + 0.47 < 0.5) l.value -= 1
      // rain streaks running down from the top, a pixel wide
      if (hash2(x, 0, o.seed + 2) > 0.96 && v > H * 0.35 && hash2(x, y >> 3, o.seed + 3) > 0.25) l.value -= 1
      // hairline cracks: a short stepped line
      const cx = Math.floor(x / 23),
        cy = Math.floor(y / 19)
      if (hash2(cx, cy, o.seed + 6) > 0.86) {
        const lx = x - cx * 23 - 6,
          ly = y - cy * 19 - 4
        if (lx >= 0 && lx < 7 && ly === Math.floor(lx * 0.7) + (hash2(cx, cy, o.seed + 7) > 0.5 ? 0 : lx >> 2)) return lvl(ramp, top - 2)
      }
      return lvl(ramp, l.value)
    })
  if (ramp === "plaster" && material === "plaster") {
    for (const n = { value: 0 }; n.value < 2; n.value++) {
      const pw = 18 + rng.int(10),
        ph = 12 + rng.int(6)
      const px = rng.int(Math.max(1, W - pw)),
        py = rng.int(Math.max(1, H - ph))
      for (const y = { value: py }; y.value < py + ph; y.value++)
        for (const x = { value: px }; x.value < px + pw; x.value++) {
          if (hash2(x.value, y.value, o.seed) * 0.35 + Math.hypot((x.value - px - pw / 2) / pw, (y.value - py - ph / 2) / ph) * 2 > 1.05) continue
          const row = Math.floor(y.value / 5)
          const f = (x.value + (row % 2) * 4) % 9 === 0 || y.value % 5 === 0
          b.set({ x: x.value, y: y.value, color: pick({ ramp: "stone", b: f ? 0.2 : 0.5 + hash2(((x.value + (row % 2) * 4) / 9) | 0, row, 1) * 0.3, x: x.value, y: y.value }) })
        }
    }
  }
  // timber: flat tones with grain as short dark runs, and the odd knot
  const timberC = (x: number, y: number, l = 0.5) => lvl("timber", Math.round(l * 4) + (hash2(x >> 3, y, 3) > 0.86 ? -1 : 0) + (hash2(x >> 2, y >> 2, 8) > 0.97 ? -1 : 0))
  const posts: number[] = []
  if (o.timber) {
    const np = Math.max(2, Math.round(o.w / 1.15))
    const sp = (W - T) / np
    for (const k = { value: 0 }; k.value <= np; k.value++) posts.push(Math.round(k.value * sp))
    const beamRows: number[] = [H - T]
    for (const f = { value: 1 }; f.value < o.floors; f.value++) beamRows.push(Math.round(H - f.value * fh - T / 2))
    beamRows.push(0)
    for (const by of beamRows)
      for (const y = { value: by }; y.value < by + T; y.value++)
        for (const x = { value: 0 }; x.value < W; x.value++) b.set({ x: x.value, y: y.value, color: timberC(x.value, y.value, y.value === by ? 0.72 : y.value === by + T - 1 ? 0.28 : 0.48) })
    for (const px of posts)
      for (const y = { value: 0 }; y.value < H; y.value++)
        for (const x = { value: px }; x.value < px + T; x.value++) b.set({ x: x.value, y: y.value, color: timberC(x.value, y.value, x.value === px ? 0.68 : x.value === px + T - 1 ? 0.3 : 0.45) })
    for (const f = { value: 0 }; f.value < o.floors; f.value++) {
      const y0 = Math.round(H - f.value * fh - T),
        y1 = Math.round(H - (f.value + 1) * fh + T)
      for (const k = { value: 0 }; k.value < posts.length - 1; k.value++) {
        if (hash2(k.value, f.value, o.seed) < 0.5) continue
        const xa = posts[k.value] + T,
          xb = posts[k.value + 1]
        const dir = hash2(k.value, f.value, o.seed + 1) > 0.5
        const steps = y0 - y1
        for (const s = { value: 0 }; s.value <= steps; s.value++) {
          const y = y0 - s.value
          const xx = Math.round(xa + (xb - xa - T) * (dir ? s.value / steps : 1 - s.value / steps))
          for (const d = { value: 0 }; d.value < T; d.value++) b.set({ x: xx + d.value, y: y, color: timberC(xx + d.value, y, d.value === 0 ? 0.62 : 0.42) })
        }
      }
    }
    // wooden pegs
    for (const px of posts)
      for (const f = { value: 0 }; f.value <= o.floors; f.value++) {
        const y = Math.round(H - f.value * fh) - T + 1
        if (y > 0 && y < H) b.set({ x: px + 2, y: y + 1, color: RAMPS.timber[0] })
      }
  }
  const kind = o.windowKind ?? "leaded"
  const winW = kind === "small" ? 12 : 18,
    winH = kind === "small" ? 14 : 22
  const shutter = o.shutter ?? rng.pick(["cGreen", "cBlue", "cRed", "wood"])
  const drawWindow = (cx: number, top: number) => {
    const x0 = cx - (winW >> 1)
    const lit = rng.next() < 0.55
    if (lit) anyLit.value = true
    for (const y = { value: top - 2 }; y.value <= top + winH + 1; y.value++)
      for (const x = { value: x0 - 2 }; x.value <= x0 + winW + 1; x.value++)
        b.set({ x: x.value, y: y.value, color: pick({ ramp: "timber", b: x.value < x0 || y.value < top ? 0.68 : 0.4, x: x.value, y: y.value }) })
    for (const y = { value: top }; y.value < top + winH; y.value++)
      for (const x = { value: x0 }; x.value < x0 + winW; x.value++) {
        // leaded diamond panes, or four square panes, or one small pane
        const dx = (x.value - x0) % 6,
          dy = (y.value - top) % 6
        const lead = kind === "leaded" ? dx === dy || dx === 5 - dy : false
        const gl = { value: 0.28 - ((y.value - top) / winH) * 0.15 + (x.value - x0 < 6 && y.value - top < 8 ? 0.45 : 0) + (hash2((x.value / 6) | 0, (y.value / 6) | 0, 2) - 0.5) * 0.15 }
        b.set({ x: x.value, y: y.value, color: lead ? pick({ ramp: "iron", b: 0.2, x: x.value, y: y.value }) : pick({ ramp: "glass", b: gl.value, x: x.value, y: y.value }) })
        if (lit && !lead) glow.set({ x: x.value, y: y.value, color: pick({ ramp: "fire", b: 0.55 + ((y.value - top) / winH) * 0.4 - (Math.abs(x.value - cx) / winW) * 0.4, x: x.value, y: y.value }) })
      }
    for (const y = { value: top }; y.value < top + winH; y.value++) {
      b.set({ x: cx, y: y.value, color: pick({ ramp: "timber", b: 0.55, x: cx, y: y.value }) })
      b.set({ x: cx - 1, y: y.value, color: pick({ ramp: "timber", b: 0.35, x: cx, y: y.value }) })
    }
    for (const x = { value: x0 }; x.value < x0 + winW; x.value++) {
      b.set({ x: x.value, y: top + 10, color: pick({ ramp: "timber", b: 0.55, x: x.value, y: 0 }) })
      b.set({ x: x.value, y: top + 11, color: pick({ ramp: "timber", b: 0.3, x: x.value, y: 0 }) })
    }
    // shut: the two leaves swung in over the panes, meeting in the middle, the hinges on the frame
    if (o.shut)
      for (const y = { value: top - 1 }; y.value <= top + winH; y.value++)
        for (const x = { value: x0 - 1 }; x.value <= x0 + winW; x.value++) {
          const k = (x.value - x0 + 1) % 4
          const meet = Math.abs(x.value - cx + 0.5) < 1
          const z = Math.abs(y.value - (top + 4)) < 1 || Math.abs(y.value - (top + winH - 5)) < 1
          const l = { value: meet ? 0.22 : z ? 0.3 : k === 0 ? 0.35 : k === 1 ? 0.68 : 0.55 }
          l.value += (vnoise({ x: x.value, y: y.value, scale: 0.3, seed: 5 }) - 0.5) * 0.15
          b.set({ x: x.value, y: y.value, color: pick({ ramp: shutter, b: l.value, x: x.value, y: y.value, dither: 0.3 }) })
        }
    for (const side of o.shut ? [] : [-1, 1]) {
      const sx0 = side < 0 ? x0 - 12 : x0 + winW + 2
      for (const y = { value: top - 2 }; y.value <= top + winH + 1; y.value++)
        for (const x = { value: sx0 }; x.value < sx0 + 10; x.value++) {
          const k = (x.value - sx0) % 4
          const z = Math.abs(y.value - (top + 4)) < 1 || Math.abs(y.value - (top + winH - 5)) < 1
          const diag = Math.abs(x.value - sx0 - (y.value - top - 5) * 0.6) < 1 && y.value > top + 4 && y.value < top + winH - 5
          const l = { value: z || diag ? 0.3 : k === 0 ? 0.35 : k === 1 ? 0.68 : 0.55 }
          l.value += (vnoise({ x: x.value, y: y.value, scale: 0.3, seed: 5 }) - 0.5) * 0.15
          b.set({ x: x.value, y: y.value, color: pick({ ramp: shutter, b: l.value, x: x.value, y: y.value, dither: 0.3 }) })
        }
      // hinge
      const hx = side < 0 ? x0 - 3 : x0 + winW + 2
      b.set({ x: hx, y: top + 4, color: RAMPS.iron[1] })
      b.set({ x: hx, y: top + winH - 5, color: RAMPS.iron[1] })
    }
    for (const x = { value: x0 - 4 }; x.value <= x0 + winW + 3; x.value++) {
      b.set({ x: x.value, y: top + winH + 2, color: pick({ ramp: "stone", b: 0.78, x: x.value, y: 0 }) })
      b.set({ x: x.value, y: top + winH + 3, color: pick({ ramp: "stone", b: 0.35, x: x.value, y: 0 }) })
    }
    if (o.flowers && rng.next() < 0.7) {
      for (const x = { value: x0 - 2 }; x.value <= x0 + winW + 1; x.value++)
        for (const y = { value: top + winH + 4 }; y.value < top + winH + 10; y.value++)
          b.set({ x: x.value, y: y.value, color: pick({ ramp: "wood", b: y.value === top + winH + 4 ? 0.7 : (x.value - x0) % 5 === 0 ? 0.3 : 0.5, x: x.value, y: y.value }) })
      const fcs = [hex("#c84848"), hex("#e08ab0"), hex("#f0d060"), hex("#f2eee2"), hex("#9a6ac8")]
      const fc = rng.pick(fcs),
        fc2 = rng.pick(fcs)
      for (const x = { value: x0 - 2 }; x.value <= x0 + winW + 1; x.value++) {
        const hgt = 2 + Math.floor(hash2(x.value, 0, o.seed) * 5)
        for (const k = { value: 0 }; k.value < hgt; k.value++)
          b.set({ x: x.value, y: top + winH + 3 - k.value, color: pick({ ramp: "leaf", b: 0.35 + k.value * 0.1 + hash2(x.value, k.value, 1) * 0.15, x: x.value, y: k.value }) })
        if (hash2(x.value, 1, o.seed) > 0.55) {
          const yy = top + winH + 4 - hgt,
            c = hash2(x.value, 2, o.seed) > 0.5 ? fc : fc2
          b.set({ x: x.value, y: yy, color: c })
          b.set({ x: x.value, y: yy - 1, color: c })
          if (hash2(x.value, 3, o.seed) > 0.5) b.set({ x: x.value + 1, y: yy, color: c })
        }
      }
      // trailing ivy below
      for (const x = { value: x0 - 2 }; x.value <= x0 + winW + 1; x.value += 3) {
        const l = Math.floor(hash2(x.value, 4, o.seed) * 7)
        for (const k = { value: 0 }; k.value < l; k.value++)
          b.set({ x: x.value + (k.value % 2), y: top + winH + 10 + k.value, color: pick({ ramp: "leaf", b: 0.3 + (k.value % 2) * 0.2, x: x.value, y: k.value }) })
      }
    }
  }
  const doorW = 24,
    doorH = Math.min(44, Math.round(fh) - 8)
  const doorX = { value: -100 }
  if (o.door !== undefined) {
    doorX.value = Math.round(o.door * PPU)
    const x0 = doorX.value - doorW / 2,
      top = H - T - doorH
    for (const y = { value: top - 4 }; y.value < H - T; y.value++)
      for (const x = { value: x0 - 4 }; x.value < x0 + doorW + 4; x.value++) {
        const inner = x.value >= x0 && x.value < x0 + doorW && y.value >= top
        const arch = (o.doorKind ?? "arched") !== "plank" && y.value - top < 6 && Math.hypot(x.value - doorX.value + 0.5, (y.value - top - 6) * 2) > doorW / 2 + (inner ? 0 : 4)
        if (arch) continue
        if (!inner) {
          const blk = (((x.value - x0 + 4) / 4) | 0) + (((y.value - top) / 7) | 0)
          b.set({ x: x.value, y: y.value, color: pick({ ramp: "stone", b: (y.value - top) % 7 === 0 ? 0.25 : 0.45 + hash2(blk, (y.value / 7) | 0, 4) * 0.35, x: x.value, y: y.value }) })
          continue
        }
        const k = (x.value - x0) % 6
        const l = { value: k === 0 ? 0.25 : k === 1 ? 0.62 : 0.5 - ((y.value - top) / doorH) * 0.12 }
        if (o.doorKind === "double" && Math.abs(x.value - doorX.value) < 1) l.value = 0.15 // where the two leaves meet
        l.value += (vnoise({ x: x.value * 3, y: y.value, scale: 0.2, seed: 7 }) - 0.5) * 0.12
        const strap = (y.value - top) % 14 === 8 || (y.value - top) % 14 === 9
        if (strap && x.value < x0 + doorW - 4) {
          b.set({ x: x.value, y: y.value, color: pick({ ramp: "iron", b: (y.value - top) % 14 === 8 ? 0.55 : 0.25, x: x.value, y: y.value }) })
          continue
        }
        b.set({ x: x.value, y: y.value, color: pick({ ramp: "wood", b: l.value, x: x.value, y: y.value, dither: 0.3 }) })
      }
    const ky = top + Math.round(doorH * 0.55)
    b.rect({ x: x0 + doorW - 6, y: ky, width: 3, height: 3, color: RAMPS.iron[1] })
    b.set({ x: x0 + doorW - 6, y: ky, color: RAMPS.iron[4] })
    b.set({ x: x0 + doorW - 5, y: ky + 4, color: RAMPS.iron[3] })
    b.set({ x: x0 + doorW - 5, y: ky + 5, color: RAMPS.iron[2] })
    b.set({ x: x0 + doorW - 5, y: ky + 6, color: RAMPS.iron[3] })
  }
  if (o.opening) {
    const x0 = 6,
      x1 = W - 6,
      top = Math.round(H - fh + 10)
    for (const y = { value: top }; y.value < H - T; y.value++)
      for (const x = { value: x0 }; x.value < x1; x.value++)
        b.set({ x: x.value, y: y.value, color: pick({ ramp: "timber", b: 0.06 + ((y.value - top) / (H - top)) * 0.18 + hash2(x.value, y.value, 1) * 0.05, x: x.value, y: y.value }) })
    for (const x = { value: x0 - 4 }; x.value < x1 + 4; x.value++)
      for (const y = { value: top - 6 }; y.value < top; y.value++) b.set({ x: x.value, y: y.value, color: timberC(x.value, y.value, y.value === top - 6 ? 0.7 : 0.45) })
  }
  if (o.windows !== false) {
    for (const f = { value: 0 }; f.value < o.floors; f.value++) {
      const top = Math.round(H - (f.value + 1) * fh + fh * 0.26)
      const slots: number[] = []
      if (posts.length > 1) for (const k = { value: 0 }; k.value < posts.length - 1; k.value++) slots.push(Math.round((posts[k.value] + posts[k.value + 1] + T) / 2))
      else for (const u = { value: 0.9 }; u.value < o.w - 0.5; u.value += 1.5) slots.push(Math.round(u.value * PPU))
      slots.forEach((cx, k) => {
        if (Math.abs(cx - doorX.value) < 30 && f.value === 0) return
        if (o.opening && f.value === 0) return
        if (hash2(k, f.value, o.seed + 4) < 0.22) return
        if (cx - winW / 2 - 12 < 0 || cx + winW / 2 + 12 > W) return
        drawWindow(cx, top)
      })
    }
  }
  return [b, anyLit.value ? glow : null]
}
