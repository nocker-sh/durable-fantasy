import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { RAMPS } from "#/world/scene/pix"
import { hash2 } from "#/lib/engine/hash2"
import { seamlessNoise } from "#/world/scene/textures/seamless-noise"
import { ToneMap } from "#/world/scene/textures/tone-map"
import { downsampleDithered } from "#/lib/graphics/downsample-dithered"
import { TEXEL_PPU } from "#/world/scene/textures/palette"

type Props = {
  ramp?: string
  light?: number
  seed?: number
  size?: number
}

/**
 * Roof tiles painted soft but old and weathered: courses of tiles whose tone drifts in broad
 * washes, each course lit along its top and resting in the soft shadow of the one above; the odd
 * fresh or burnt tile from another batch, slipped and cracked tiles, knocked-off corners; stains
 * spreading in patches and rain stains running down the slope; moss in the damp, creeping along
 * the joints, and pale lichen rosettes on the dry tiles. Short strokes along the courses gather
 * the colours into brush marks.
 */
export function roofTex(props: Props): PixBuf {
  const ramp = props.ramp === undefined ? "roof" : props.ramp
  const light = props.light === undefined ? 0.6 : props.light
  const seed = props.seed === undefined ? 3 : props.seed
  const size = props.size === undefined ? 256 : props.size
  // painted at 256 pixels to the 4-unit repeat, then shrunk to the chunky texels of the walls
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
    // tiles from other batches: the odd fresh one put in after a storm, the odd old one burnt dark
    const batch = hash2(c % cols, row, seed + 31)
    if (batch > 0.92) l.value += 0.7
    else if (batch < 0.07) l.value -= 0.8
    if (hash2(c % cols, row, seed + 21) > 0.95) l.value -= 0.5 // a slipped tile, a little in shadow
    // old stains spreading over the roof in soft patches, a lighter and a darker step
    const stain = seamlessNoise({ x: x, y: y, scale: 0.06 / k, seed: seed + 33, w: size, h: size })
    if (stain > 0.72) l.value -= 1
    else if (stain > 0.62) l.value -= 0.5
    // rain stains running down the slope from the tiles above, a couple of pixels wide
    const sc = x >> 2
    if (hash2(sc, 0, seed + 40) > 0.86) {
      const run = (y - Math.floor(hash2(sc, 1, seed + 40) * size) + size) % size
      const len = 24 * k + hash2(sc, 2, seed + 40) * 40 * k
      if (run < len && hash2(sc, run >> 3, seed + 41) > 0.2) l.value -= run < len * 0.6 ? 0.6 : 0.4
    }
    const clump = seamlessNoise({ x: x, y: y, scale: 0.22 / k, seed: seed + 9, w: size, h: size })
    const mossy = damp > 0.6 && clump > 0.45 + (0.75 - damp) * 1.6
    // the tile above's shadow along the foot of the course, its edge ragged from tile to tile; moss creeps along it where it is damp
    const foot = 0.8 + (hash2(c % cols, row, seed + 3) - 0.5) * 0.1
    if (fv > foot) return damp > 0.55 && hash2(x >> 1, row, seed + 22) > 0.45 ? { ramp: "moss", level: 2.4 + (wash - 0.5), region: -1 } : { ramp: ramp, level: l.value - 1.7, region: -1 }
    // the joint between two tiles: faint, and only on most of them
    if (fu < 0.07 && fv < 0.7 && hash2(c % cols, row, seed + 4) > 0.25) return mossy ? { ramp: "moss", level: 2.6, region: -1 } : { ramp: ramp, level: l.value - 1.1, region: -1 }
    // a corner knocked off: the shadow of the tile beneath shows through
    if (hash2(c % cols, row, seed + 24) > 0.82 && fu > 0.8 && fv > 0.5) return { ramp: ramp, level: base - 1.6, region: -1 }
    // a crack running down the odd tile
    if (hash2(c % cols, row, seed + 26) > 0.9 && Math.abs(fu - 0.35 - fv * 0.25) < 0.035) return { ramp: ramp, level: l.value - 1.4, region: -1 }
    if (fv < 0.25) l.value += 0.8 // lit top of the tile
    else if (fv > 0.6) l.value -= 0.4 // and shading towards its foot
    // moss in clumps where the roof stays damp, lit on its upper side
    if (mossy && fv > 0.25) return { ramp: "moss", level: 3.4 + (fv < 0.5 ? 0.5 : 0) + (wash - 0.5) + (clump > 0.62 ? 0.5 : 0), region: tile }
    // pale lichen in small rosettes on the dry tiles
    const lichen = seamlessNoise({ x: x, y: y, scale: 0.4 / k, seed: seed + 28, w: size, h: size })
    if (damp < 0.5 && lichen > 0.8) return { ramp: "sand", level: lichen > 0.86 ? 4.5 : 3.8, region: tile }
    return { ramp: ramp, level: l.value, region: tile }
  })
  t.strokes({ seed: seed, density: 0.14, along: "x", len: [2, 6], thick: [1, 2], step: 0.5, bleed: 0.08, wrap: true })
  return downsampleDithered(t.paint(ramp.startsWith("slate") ? 0.08 : 0.14), size / (TEXEL_PPU * 4))
}
