import type { Trace } from "../traces.ts"

export type Use = "土間" | "台所" | "食事" | "寝間" | "作業場" | "売り場" | "貯蔵" | "住まい" | "客室" | "家畜"

export interface Rect {
  x0: number
  z0: number
  x1: number
  z1: number
}

export interface PRoom extends Rect {
  name: string
  use: Use
  floor: number
}

export type DividerKind = "壁" | "腰壁" | "カーテン" | "棚"

/** A partition: a thin strip, with the gaps to pass through already left out. */
export interface Divider extends Rect {
  floor: number
  kind: DividerKind
}

export interface Placed extends Rect {
  name: string
  floor: number
  /** blocks walking (a rug, a trace on the floor does not) */
  solid: boolean
  /** stands against a wall or a partition */
  wall: boolean
  /** a trace of life: where it lies */
  on?: Trace["on"]
}

export interface FloorPlan {
  id: string
  /** the floor inside the walls (m): x across, z from the back wall (0) to the front, where the door is */
  W: number
  D: number
  floors: number
  /** the door, on the front wall, at this x */
  door: number
  rooms: PRoom[]
  dividers: Divider[]
  pieces: Placed[]
  /** what would not go anywhere (a test keeps this empty) */
  unplaced: string[]
}
