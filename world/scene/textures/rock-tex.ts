import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { RAMPS } from "#/world/scene/pix"
import { hash2 } from "#/lib/engine/hash2"
import { lvl } from "#/world/scene/textures/palette"

type Props = {
  ramp?: string
  light?: number
  seed?: number
  size?: number
}

/**
 * Rock as pixel art: broken into flat facets (cells), each lit or shaded by which way it faces,
 * dark cracks where facets meet, lichen in small pale patches.
 */
export function rockTex(props: Props): PixBuf {
  const ramp = props.ramp === undefined ? "stone" : props.ramp
  const light = props.light === undefined ? 0.5 : props.light
  const seed = props.seed === undefined ? 1 : props.seed
  const size = props.size === undefined ? 64 : props.size

  const b = new PixBuf(size, size)
  const n = RAMPS[ramp].length,
    base = Math.round(light * (n - 1))
  const cell = 12,
    cells = size / cell
  // a few points per cell, wrapping, each a facet
  const pt = (gx: number, gy: number): [number, number] => {
    const wx = ((gx % cells) + cells) % cells,
      wy = ((gy % cells) + cells) % cells
    return [gx * cell + hash2(wx, wy, seed) * cell, gy * cell + hash2(wx, wy, seed + 1) * cell]
  }
  b.fill((x, y) => {
    const cx = Math.floor(x / cell),
      cy = Math.floor(y / cell)
    const d1 = { value: 1e9 },
      d2 = { value: 1e9 },
      best: { value: [number, number] } = { value: [0, 0] }
    for (const oy = { value: -1 }; oy.value <= 1; oy.value++)
      for (const ox = { value: -1 }; ox.value <= 1; ox.value++) {
        const bindingValue0 = pt(cx + ox.value, cy + oy.value),
          px = bindingValue0[0],
          py = bindingValue0[1]
        const d = (px - x) ** 2 + (py - y) ** 2
        if (d < d1.value) {
          d2.value = d1.value
          d1.value = d
          best.value = [cx + ox.value, cy + oy.value]
        } else if (d < d2.value) d2.value = d
      }
    if (Math.sqrt(d2.value) - Math.sqrt(d1.value) < 1.1) return lvl(ramp, base - 2) // crack
    const wx = ((best.value[0] % cells) + cells) % cells,
      wy = ((best.value[1] % cells) + cells) % cells
    const face = hash2(wx, wy, seed + 2)
    const l = { value: base + (face > 0.66 ? 1 : face < 0.25 ? -1 : 0) }
    // lichen: a few pale spots on some facets
    if (hash2(wx, wy, seed + 3) > 0.7 && hash2(x >> 1, y >> 1, seed + 4) > 0.82) return lvl("frost", 2)
    // the facet's edge nearest the light, a pixel lighter
    if (Math.sqrt(d2.value) - Math.sqrt(d1.value) < 2.2 && y < best.value[1] * cell + cell / 2) l.value += 1
    return lvl(ramp, l.value)
  })
  return b
}
