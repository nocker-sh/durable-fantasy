import type { Cell, Interior } from "#/world/town/interiors"

export type StairLink = { at: Cell; to: { map: string; at: Cell } }
export type InteriorStairRoom = Readonly<{ interior: Interior; rows: readonly string[] }>
export type InteriorStairEndpoint = Readonly<{ map: string; at: Cell; targetMap: string; targetAt: Cell }>
