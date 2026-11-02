import { SPPU } from "#/world/scene/figure/render"
import { TEXEL_PPU } from "#/world/scene/textures/palette"

/** Villagers fit the outdoor buildings at this scale; actor cards and physical authoring checks share it. */
export const FIG = SPPU / 67.5
export const FIG_PPU = SPPU / FIG
/**
 * People are drawn this many times finer than the world's one dot (TEXEL_PPU) and shrunk by it before
 * they stand in the world (shrink-sprite.ts); the scene is drawn at FIG_PPU / FIG_DOT pixels to a unit.
 */
export const FIG_DOT = Math.round(FIG_PPU / TEXEL_PPU)
