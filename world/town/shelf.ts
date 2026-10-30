import type { LidHandleDimensions } from "#/world/town/storage-box-types"

export type ShelfSpec = {
  height: number
  board: number
  items?: readonly ShelfItem[]
  levels: readonly number[]
  front: "n" | "s" | "w" | "e"
}

export type ShelfPart = {
  part: "side" | "back" | "board" | "contents"
  x0: number
  y0: number
  z0: number
  x1: number
  y1: number
  z1: number
}

export type StorageRetrievalSpec = {
  withdraw: number
  bodyRadius: number
  bodyAcross: number
  bodyStart: number
  bodyEnd: number
  space: number
}

export type ShelfItem = {
  id: string
  board: number
  across: number
  fromBack: number
  width: number
  height: number
  depth: number
  kind: "papers" | "box" | "linen" | "tool"
  boxMaterial?: "wood" | "iron"
  tool?: { handleWidth: number; bladeLength: number }
  wall?: number
  lid?: number
  lidHandle?: LidHandleDimensions
  lidLift?: number
  retrieval?: StorageRetrievalSpec
}
