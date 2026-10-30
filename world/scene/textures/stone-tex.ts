import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { RAMPS } from "#/world/scene/pix"
import { hash2 } from "#/lib/engine/hash2"
import { lvl } from "#/world/scene/textures/palette"

type Props = {
  ramp?: string
  light?: number
  seed?: number
  bw?: number
  bh?: number
  size?: number
}

/** Laid stone: each block a flat tone, lit along its top, shadowed at its foot, mortar between. */
export function stoneTex(props: Props): PixBuf {
  const ramp = props.ramp === undefined ? "stone" : props.ramp
  const light = props.light === undefined ? 0.55 : props.light
  const seed = props.seed === undefined ? 1 : props.seed
  const bw = props.bw === undefined ? 20 : props.bw
  const bh = props.bh === undefined ? 11 : props.bh
  const size = props.size === undefined ? 128 : props.size

  const b = new PixBuf(size, size)
  const n = RAMPS[ramp].length,
    base = Math.round(light * (n - 1))
  b.fill((x, y) => {
    const row = Math.floor(y / bh)
    const uu = x / bw + (row % 2) * 0.5
    const c = Math.floor(uu)
    const fu = uu - c,
      fv = y / bh - row
    const h = hash2(c % Math.round(size / bw), row, seed)
    const l = { value: base + (h > 0.8 ? 1 : h < 0.15 ? -1 : 0) }
    if (fu < 0.06 || fv > 0.88) return lvl(ramp, base - 2) // mortar
    if (fv < 0.18) l.value += 1
    else if (fv > 0.74 || fu > 0.9) l.value -= 1
    // a chipped corner or a stain, as a small block of the darker tone
    if (hash2(c, row, seed + 11) > 0.85 && fu > 0.6 && fv > 0.45) l.value -= 1
    return lvl(ramp, l.value)
  })
  return b
}
