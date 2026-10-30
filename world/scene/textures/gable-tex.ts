import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { RAMPS } from "#/world/scene/pix"
import { bayer } from "#/world/scene/bayer"
import { vnoise } from "#/lib/engine/vnoise"
import { lvl, PPU } from "#/world/scene/textures/palette"

type Props = {
  w: number
  h: number
  timber: boolean
  seed: number
  ramp?: string
}

/** Gable triangle plaster with king post. v=0 bottom. */
export function gableTex(props: Props): PixBuf {
  const ramp = props.ramp === undefined ? "plaster" : props.ramp

  const W = Math.max(8, Math.round(props.w * PPU)),
    H = Math.max(4, Math.round(props.h * PPU))
  const b = new PixBuf(W, H)
  b.fill((x, y) => {
    const n = RAMPS[ramp].length,
      top = Math.round(0.7 * (n - 1))
    if (props.timber && (Math.abs(x - W / 2) < 3 || y > H - 6)) return lvl("timber", Math.abs(x - W / 2) < 1 || y === H - 6 ? 3 : 2)
    if (props.timber && Math.abs(Math.abs(x - W / 2) - (((H - y) * (W / 2)) / H) * 0.5) < 2.4 && y > H * 0.4) return lvl("timber", 2)
    const p = vnoise({ x: x, y: y, scale: 0.06, seed: props.seed })
    return lvl(ramp, p > 0.62 || (p > 0.56 && bayer(x, y) + 0.47 < (p - 0.56) / 0.06) ? top - 1 : top)
  })
  // small attic vent
  const cx = W >> 1,
    cy = Math.round(H * 0.55)
  for (const y = { value: cy - 6 }; y.value < cy + 6; y.value++)
    for (const x = { value: cx - 8 }; x.value < cx + 8; x.value++)
      if (Math.abs(x.value - cx + 0.5) > 3 && (x.value + y.value) % 4 !== 0) b.set({ x: x.value, y: y.value, color: pick({ ramp: "glass", b: 0.15, x: x.value, y: y.value }) })
  return b
}
