import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { RAMPS } from "#/world/scene/pix"
import { hash2 } from "#/lib/engine/hash2"
import { vnoise } from "#/lib/engine/vnoise"
import { PPU } from "#/world/scene/textures/palette"

type Props = {
  w: number
  h: number
  lancets: number[]
  door?: number
  rose?: boolean
  seed?: number
}

/** Ashlar stone wall with lancet windows (for the chapel). */
export function ashlarTex(props: Props): [PixBuf, PixBuf] {
  const rose = props.rose === undefined ? false : props.rose
  const seed = props.seed === undefined ? 9 : props.seed

  const W = Math.round(props.w * PPU),
    H = Math.round(props.h * PPU)
  const b = new PixBuf(W, H)
  const glow = new PixBuf(W, H)
  glow.fill(() => [0, 0, 0])
  b.fill((x, y) => {
    const bh = 12,
      row = Math.floor(y / bh)
    const bw = 26 + (row % 3) * 4
    const uu = x / bw + (row % 2) * 0.5,
      c = Math.floor(uu),
      fu = uu - c,
      fv = y / bh - row
    const l = { value: 0.6 + (hash2(c, row, seed) - 0.5) * 0.2 + (fv < 0.2 ? 0.08 : 0) - (y / H > 0.85 ? 0.15 : 0) }
    if (vnoise({ x: x, y: y, scale: 0.04, seed: seed }) > 0.72) l.value -= 0.12
    if (fu < 0.04 || fv > 0.9) l.value = 0.25
    return pick({ ramp: "sand", b: l.value, x: x, y: y, dither: 0.4 })
  })
  const lancet = (inputProps: { cx: number; top: number; ww: number; hh: number }) => {
    const cx = inputProps.cx
    const top = inputProps.top
    const ww = inputProps.ww
    const hh = inputProps.hh

    for (const y = { value: top - 4 }; y.value < top + hh + 4; y.value++)
      for (const x = { value: cx - ww / 2 - 4 }; x.value < cx + ww / 2 + 4; x.value++) {
        const dy = y.value - top,
          r = ww / 2
        const inArch = (pad: number) =>
          dy >= r + pad ? Math.abs(x.value - cx + 0.5) < r + pad : Math.hypot(Math.abs(x.value - cx + 0.5) + r * 0.6, dy - r - pad) < r * 1.6 + pad && Math.abs(x.value - cx + 0.5) < r + pad
        if (!inArch(3)) continue
        if (!inArch(0) || y.value >= top + hh) {
          b.set({ x: x.value, y: y.value, color: pick({ ramp: "sand", b: 0.8 - (x.value > cx ? 0.25 : 0), x: x.value, y: y.value }) })
          continue
        }
        const lead = (x.value - cx + 64) % 5 === 0 || (y.value - top) % 7 === 0
        const hue = ["cBlue", "cRed", "cMustard", "cGreen"][Math.floor(hash2(((x.value - cx + 64) / 5) | 0, ((y.value - top) / 7) | 0, 3) * 4)]
        b.set({ x: x.value, y: y.value, color: lead ? RAMPS.iron[0] : pick({ ramp: hue, b: 0.55, x: x.value, y: y.value }) })
        if (!lead) glow.set({ x: x.value, y: y.value, color: pick({ ramp: hue, b: 0.85, x: x.value, y: y.value }) })
      }
  }
  for (const u of props.lancets) lancet({ cx: Math.round(u * PPU), top: Math.round(H * 0.25), ww: 14, hh: Math.round(H * 0.45) })
  if (rose) {
    const cx = W / 2,
      cy = H * 0.3,
      r = 18
    for (const y = { value: cy - r - 3 }; y.value < cy + r + 3; y.value++)
      for (const x = { value: cx - r - 3 }; x.value < cx + r + 3; x.value++) {
        const d = Math.hypot(x.value - cx, y.value - cy)
        if (d > r + 3) continue
        if (d > r) {
          b.set({ x: x.value, y: y.value, color: pick({ ramp: "sand", b: 0.8, x: x.value, y: y.value }) })
          continue
        }
        const a = Math.atan2(y.value - cy, x.value - cx)
        const spoke = Math.abs((((a / Math.PI) * 4 + 8) % 1) - 0.5) < 0.12 || Math.abs(d - r * 0.45) < 1
        const hue = d < r * 0.45 ? "cMustard" : (((a / Math.PI) * 4 + 8) | 0) % 2 ? "cBlue" : "cRed"
        b.set({ x: x.value, y: y.value, color: spoke ? RAMPS.iron[0] : pick({ ramp: hue, b: 0.55, x: x.value, y: y.value }) })
        if (!spoke) glow.set({ x: x.value, y: y.value, color: pick({ ramp: hue, b: 0.85, x: x.value, y: y.value }) })
      }
  }
  if (props.door !== undefined) {
    const cx = Math.round(props.door * PPU),
      ww = 30,
      hh = 56,
      top = H - hh
    for (const y = { value: top - 8 }; y.value < H; y.value++)
      for (const x = { value: cx - ww / 2 - 8 }; x.value < cx + ww / 2 + 8; x.value++) {
        const dy = y.value - top
        const pad = Math.abs(x.value - cx) > ww / 2 || (dy < ww / 2 && Math.hypot(x.value - cx, dy - ww / 2) > ww / 2)
        const outer = Math.abs(x.value - cx) > ww / 2 + 8 || (dy < ww / 2 && Math.hypot(x.value - cx, dy - ww / 2) > ww / 2 + 8)
        if (outer) continue
        if (pad) {
          b.set({ x: x.value, y: y.value, color: pick({ ramp: "sand", b: 0.82 - ((Math.hypot(x.value - cx, Math.min(0, dy - ww / 2)) | 0) % 4 === 0 ? 0.3 : 0), x: x.value, y: y.value }) })
          continue
        }
        const k = (x.value - cx + 64) % 6
        b.set({ x: x.value, y: y.value, color: pick({ ramp: "wood", b: k === 0 ? 0.2 : 0.5 + (k === 1 ? 0.15 : 0), x: x.value, y: y.value, dither: 0.3 }) })
        if (dy % 16 === 10 && Math.abs(x.value - cx) > 2) b.set({ x: x.value, y: y.value, color: RAMPS.iron[2] })
      }
  }
  return [b, glow]
}
