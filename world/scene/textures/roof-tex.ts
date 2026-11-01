import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { RAMPS } from "#/world/scene/pix"
import { hash2 } from "#/lib/engine/hash2"
import { seamlessNoise } from "#/world/scene/textures/seamless-noise"
import { ToneMap } from "#/world/scene/textures/tone-map"

type Props = {
  ramp?: string
  light?: number
  seed?: number
  size?: number
}

/**
 * Roof tiles painted soft: courses of tiles whose tone drifts in broad washes across the roof
 * rather than jumping tile by tile, each course lit along its top and resting in the soft shadow
 * of the one above, the joints between tiles only faintly darker and broken, moss gathered in a
 * few damp patches. Short strokes along the courses gather the colours into brush marks.
 */
export function roofTex(props: Props): PixBuf {
  const ramp = props.ramp === undefined ? "roof" : props.ramp
  const light = props.light === undefined ? 0.6 : props.light
  const seed = props.seed === undefined ? 3 : props.seed
  const size = props.size === undefined ? 256 : props.size
  // 256 pixels to a 4-unit repeat: one texture pixel to about one screen pixel, as on the ground and the people
  const k = size / 128

  const n = RAMPS[ramp].length
  const base = light * (n - 1)
  const rows = Math.round(size / (10.5 * k)),
    cols = Math.round(size / (12.8 * k))
  const t = new ToneMap(size, size)
  t.fill((x, y) => {
    const rv = (y * rows) / size
    const row = Math.floor(rv),
      fv = rv - row
    const uu = (x * cols) / size + (row % 2) * 0.5
    const c = Math.floor(uu),
      fu = uu - c
    const tile = (((c % cols) + cols) % cols) + row * 64
    const wash = seamlessNoise({ x: x, y: y, scale: 0.035 / k, seed: seed + 5, w: size, h: size })
    const damp = seamlessNoise({ x: x, y: y, scale: 0.05 / k, seed: seed + 6, w: size, h: size })
    const l = { value: base + (wash - 0.5) * 1.2 + (hash2(c % cols, row, seed) - 0.5) * 0.5 }
    if (hash2(c % cols, row, seed + 21) > 0.95) l.value -= 0.5 // a slipped tile, a little in shadow
    // the tile above's shadow along the foot of the course, its edge ragged from tile to tile
    const foot = 0.8 + (hash2(c % cols, row, seed + 3) - 0.5) * 0.1
    if (fv > foot) return { ramp: ramp, level: l.value - 1, region: -1 }
    // the joint between two tiles: faint, and only on most of them
    if (fu < 0.07 && fv < 0.7 && hash2(c % cols, row, seed + 4) > 0.25) return { ramp: ramp, level: l.value - 0.5, region: -1 }
    if (fv < 0.2) l.value += 0.5 // lit top of the tile
    // moss in a few soft clumps where the roof stays damp, pale lichen on the dry tiles
    const clump = seamlessNoise({ x: x, y: y, scale: 0.22 / k, seed: seed + 9, w: size, h: size })
    if (damp > 0.72 && fv > 0.4 && clump > 0.5 + (0.78 - damp) * 2) return { ramp: "moss", level: 3.6 + (fv < 0.55 ? 0.5 : 0) + (wash - 0.5), region: tile }
    if (damp < 0.35 && hash2(x >> k, y >> k, seed + 28) > 0.985) return { ramp: ramp, level: l.value + 1, region: tile }
    return { ramp: ramp, level: l.value, region: tile }
  })
  t.strokes({ seed: seed, density: 0.14, along: "x", len: [2, 6], thick: [1, 2], step: 0.5, bleed: 0.08, wrap: true })
  return t.paint(ramp.startsWith("slate") ? 0.12 : 0.24)
}
