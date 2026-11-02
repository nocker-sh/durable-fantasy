import { RAMPS } from "#/world/scene/pix"
import { type RGB } from "#/lib/graphics/pixel-types"

export const PPU = 32

/**
 * The one size of a dot in the world, in texture pixels to a unit: the ground is painted at it, and
 * every other surface and picture (buildings, goods, decals, laundry) is painted at it or finer and
 * then shrunk to it with the old consoles' dither (lib/graphics/downsample-dithered.ts), so that
 * nothing in the world has finer or coarser dots than the ground. See architecture.md「描画」.
 */
export const TEXEL_PPU = PPU

const S = PPU / 16

/** A ramp's colour at a level (0 darkest), clamped. */
const lvl = (ramp: string, i: number): RGB => {
  const r = RAMPS[ramp]
  return r[Math.max(0, Math.min(r.length - 1, Math.round(i)))]
}

export { S, lvl }
