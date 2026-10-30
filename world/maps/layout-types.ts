import type { Vector2Tuple } from "#/lib/engine/vector2-types"

export type Road = {
  pts: Vector2Tuple[]
  w: number
  kind: "cobble" | "dirt" | "pave"
}
export type Rect = { x0: number; z0: number; x1: number; z1: number }

export type Layout = {
  /** river centre line and half width; OFF_LINE for none */
  river: Vector2Tuple[]
  riverHW: number
  /** z range where the river runs between stone embankments */
  embanked: [number, number]
  roads: Road[]
  /** round paved square and its radius; OFF_POINT for none */
  plaza: Vector2Tuple
  plazaR: number
  terrace: Rect & { h: number }
  stairs: Rect
  lavoir: Rect & { h: number }
  lavStairs: Rect
  bridge: Rect
  fields: (Rect & { axis: "x" | "z" })[]
  pigpen: Rect
  pasture: Rect
  graveyard: Rect
  gardens: Rect[]
  dirtPatches: [number, number, number, number][]
  /** the flatter, built-up part: centre and radii (wilder, hillier ground outside) */
  town: [number, number, number, number]
  /** seed for the rolling height noise */
  seed: number
  /** how rolling the ground is inside and outside the town */
  relief: [number, number]
  /** a field's own landform, applied over the rolling ground: dunes, a sea cliff, a pass */
  shape?: (inputProps: { x: number; z: number; h: number; roadD: number }) => number
  /** a field's ground: what grows or lies where no road or yard is (terrain.ts) */
  biome?: "meadow" | "dune" | "coast" | "forest" | "pass"
  /** fog colour and range (in tiles beyond the player), for haze over dunes or mist in the forest */
  fog?: { color: number; near: number; far: number }
  /** footpaths worn into the ground by people and animals: drawn only, they block and flatten nothing */
  trails?: Vector2Tuple[][]
}
