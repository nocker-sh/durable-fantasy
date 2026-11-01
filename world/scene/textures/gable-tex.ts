import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { RAMPS } from "#/world/scene/pix"
import { PPU } from "#/world/scene/textures/palette"
import { plasterWall } from "#/world/scene/textures/plaster-wall"
import { ToneMap } from "#/world/scene/textures/tone-map"

type Props = {
  w: number
  h: number
  timber: boolean
  seed: number
  ramp?: string
}

/** Gable triangle plaster with king post, painted like the walls below it. v=0 bottom. */
export function gableTex(props: Props): PixBuf {
  const ramp = props.ramp === undefined ? "plaster" : props.ramp

  const W = Math.max(8, Math.round(props.w * PPU)),
    H = Math.max(4, Math.round(props.h * PPU))
  const top = 0.66 * (RAMPS[ramp].length - 1)
  const t = new ToneMap(W, H)
  t.fill((x, y) => {
    if (props.timber && (Math.abs(x - W / 2) < 3 || y > H - 6)) return { ramp: "timber", level: Math.abs(x - W / 2) < 1 || y === H - 6 ? 3.4 : 2.8, region: -1 }
    if (props.timber && Math.abs(Math.abs(x - W / 2) - (((H - y) * (W / 2)) / H) * 0.5) < 2.4 && y > H * 0.4) return { ramp: "timber", level: 2.8, region: -2 }
    // the gable sits in the eaves' shade more than the walls do: a touch darker towards the peak
    const p = plasterWall({ x: x, y: y, H: H + 40, seed: props.seed, ramp: ramp, top: top - 0.2 })
    return { ...p, level: p.level - Math.max(0, 1 - y / H) * 0.4 }
  })
  t.strokes({ seed: props.seed, density: 0.1, along: "x", len: [2, 5], thick: [1, 2], step: 0.5, bleed: 0.06 })
  const b = t.paint(0.18)
  // small attic vent
  const cx = W >> 1,
    cy = Math.round(H * 0.55)
  for (const y = { value: cy - 6 }; y.value < cy + 6; y.value++)
    for (const x = { value: cx - 8 }; x.value < cx + 8; x.value++)
      if (Math.abs(x.value - cx + 0.5) > 3 && (x.value + y.value) % 4 !== 0) b.set({ x: x.value, y: y.value, color: pick({ ramp: "glass", b: 0.2, x: x.value, y: y.value, dither: 0.2 }) })
  return b
}
