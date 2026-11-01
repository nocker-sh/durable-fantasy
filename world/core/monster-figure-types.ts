/** The colours a figure is painted in. `eye` is drawn unlit; every other paint is lit like the hare's fur. */
export type FigurePaint = "hide" | "belly" | "dark" | "eye" | "accent" | "bone" | "glow"

/**
 * box: width, height, depth. ball: the three radii (x, y, z). cone: base radius, height, sides.
 * rod: top radius, height, bottom radius. Sizes are in tiles (1 tile = 1.4 m) before the kind's `size`.
 */
export type FigureShape = "box" | "ball" | "cone" | "rod"

/**
 * How a part moves while the creature goes about. stride-a and stride-b swing opposite each other (legs),
 * flap beats up and down (wings, fins, ears), wag swings side to side (tails), nod tips forward (heads),
 * sway rocks slowly side to side (stalks, antennae), pulse breathes in and out (sacs, glows).
 */
export type FigureSwing = "stride-a" | "stride-b" | "flap" | "wag" | "nod" | "sway" | "pulse"

export type FigurePart = {
  shape: FigureShape
  size: readonly [number, number, number]
  /** centre of the part; y = 0 is the ground, +z is where the face looks */
  at: readonly [number, number, number]
  /** euler rotation in radians (x, y, z) */
  turn?: readonly [number, number, number]
  paint: FigurePaint
  swing?: FigureSwing
  /** the joint a swinging part turns about; defaults to the top centre of the part */
  pivot?: readonly [number, number, number]
}

/** A creature built from plain lit blocks, like the hare. Individual through shape first, colour second. */
export type MonsterFigure = {
  palette: { hide: number; belly?: number; dark?: number; eye?: number; accent?: number; bone?: number; glow?: number }
  parts: readonly FigurePart[]
}
