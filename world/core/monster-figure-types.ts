/** The colours a block creature is painted in. `eye` and `glow` are drawn unlit; every other paint is lit like the hare's fur. */
export type FigurePaint = "hide" | "belly" | "dark" | "eye" | "accent" | "bone" | "glow"

/**
 * box: width, height, depth. ball: the three radii (x, y, z). cone: base radius, height, sides.
 * rod: top radius, height, bottom radius. Sizes are in tiles (1 tile = 1.4 m) before the kind's `size`.
 */
export type FigureShape = "box" | "ball" | "cone" | "rod"

export type FigurePalette = { hide: number; belly?: number; dark?: number; eye?: number; accent?: number; bone?: number; glow?: number }
