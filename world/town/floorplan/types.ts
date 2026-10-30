import type { HearthSpec } from "#/world/town/hearth-types"
import type { CookingTopSpec } from "#/world/town/get-cooking-top-box"
import type { ShelfSpec } from "#/world/town/shelf"
import type { BedSpec } from "#/world/town/bed-types"
import type { WindowFixture, LampFixture, SeatSpec, WorkSurfaceSpec } from "#/world/town/room-fixtures"
import type { StairSection } from "#/world/town/floorplan/stair-geometry"
import type { FurnitureKind } from "#/world/town/furniture-kinds"
import type { Trace } from "#/world/town/traces"

export type Use = "共用" | "土間" | "台所" | "食事" | "寝間" | "作業場" | "売り場" | "貯蔵" | "住まい" | "客室" | "家畜"

export type Rect = {
  x0: number
  z0: number
  x1: number
  z1: number
}

export type PRoom = Rect & {
  name: string
  use: Use
  floor: number
}

export type DividerKind = "壁" | "腰壁" | "カーテン" | "棚"

/** A partition: a thin strip, with the gaps to pass through already left out. */
export type Divider = Rect & {
  floor: number
  kind: DividerKind
}

export type Placed = Rect & {
  cookingTop?: CookingTopSpec
  hearth?: HearthSpec
  hearthFront?: import("../../../lib/engine/rectangle-face").RectangleSide
  shelf?: ShelfSpec
  bed?: BedSpec
  seat?: SeatSpec
  workSurface?: WorkSurfaceSpec
  kind?: FurnitureKind
  wallMount?: { side: "n" | "e" | "s" | "w"; bottom: number; height: number }
  /** Stable symbol from an authored room diagram. */
  label?: string
  name: string
  floor: number
  /** blocks walking (a rug, a trace on the floor does not) */
  solid: boolean
  /** stands against a wall or a partition */
  wall: boolean
  /** a trace of life: where it lies */
  on?: Trace["on"]
}

export type FlueSection = Rect & {
  wallThickness: number
  floorCollar: number
  floorSupport: { depth: number; steps: number }
  lowerFloor: number
  upperFloor: number
}

export type FloorPlan = {
  /** An explicitly authored grid, not an automatically fitted arrangement. */
  authored?: boolean
  cellSize?: number
  entrance?: { point: readonly [number, number]; outward: readonly [number, number] }
  doorWidth?: number
  doorHeight?: number
  windows?: readonly WindowFixture[]
  lamps?: readonly LampFixture[]
  flues?: readonly FlueSection[]
  stairSections?: readonly StairSection[]
  floorLevels?: readonly { floor: number; elevation: number; ceiling: number; thickness: number }[]
  id: string
  /** the floor inside the walls (m): x across, z from the back wall (0) to the front, where the door is */
  W: number
  D: number
  floors: number
  /** Legacy fitted plans place the door on the south wall at this x; authored plans use entrance. */
  door: number
  /** Declared rooms with no same-name, same-floor counterpart in the generated plan. */
  unrepresentedRooms: readonly { floor: number; name: string }[]
  rooms: PRoom[]
  dividers: Divider[]
  pieces: Placed[]
  /** what would not go anywhere (a test keeps this empty) */
  unplaced: string[]
}
