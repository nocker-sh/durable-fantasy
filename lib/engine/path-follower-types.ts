import type { Vector2Tuple } from "#/lib/engine/vector2-types"

export type PathFollowerState = Readonly<{ pos: Vector2Tuple; path: Vector2Tuple[] }>
export type PathAdvance = { remaining: number; consumed: number; heading: number | null }
