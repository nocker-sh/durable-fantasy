import type { Rect } from "#/world/maps/layout-types"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"

export const OFF: Rect & { h: number } = { x0: -99, z0: -99, x1: -98, z1: -98, h: 0 }
export const OFF_POINT: Vector2Tuple = [-99, -99]
export const OFF_LINE: Vector2Tuple[] = [
  [-99, -99],
  [-98, -99],
]
