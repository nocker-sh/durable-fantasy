import type { RGB } from "#/lib/graphics/pixel-types"
import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import { N } from "#/world/scene/world"
import { PPU } from "#/world/scene/textures/palette"

export // ---------------------------------------------------------------- little drawn shapes
// The ground is not noise: it is drawn from small pixel shapes (tufts, pebbles, needles, petals)
// scattered on a jittered grid, over a few flat tones with dithered edges between them.
// In a shape: '.' nothing, digits are steps from the ground's own tone (5 = two lighter … 1 = two
// darker), letters are fixed colours.
type Stamp = readonly string[]

export const TUFTS: Stamp[] = [
  [".4...4.", ".4.5.4.", "43.4.43", "3343433", ".22222."],
  ["..5..", ".545.", "43434", ".222."],
  ["4...4", "34.43", ".333.", ".222."],
  ["..4.", ".54.", "434.", "222."],
  [".5.4.", ".4.4.", "43434", ".2.2."],
]

export const SPRIGS: Stamp[] = [
  ["4.", "34", "2."],
  [".4", "43", ".2"],
  ["5", "4", "2"],
]

export const GROUND_PX = N * PPU

export const ASH_LIGHT: RGB = hex("#a8a49c"),
  ASH_DARK: RGB = hex("#8a867e")
