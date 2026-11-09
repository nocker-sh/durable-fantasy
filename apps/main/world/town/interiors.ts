import type { FramedWindow, LampFixture } from "#/world/town/room-fixtures"
import type { FlueSection, Placed } from "#/world/town/floorplan/types"
import type { StairSection } from "#/world/town/floorplan/stair-geometry"
import type { FurnitureKind } from "#/world/town/furniture-kinds"
import { HOUSES } from "#/world/town/houses"
import { enterable } from "#/world/town/enterable"
import type { HouseDef } from "#/world/town/house-types"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import { interiorPlan } from "#/world/town/interior-plan"

export type Cell = readonly [number, number]

export type Furniture = {
  seat?: Placed["seat"]
  cookingTop?: Placed["cookingTop"]
  hearth?: Placed["hearth"]
  hearthFront?: Placed["hearthFront"]
  shelf?: Placed["shelf"]
  bed?: Placed["bed"]
  workSurface?: Placed["workSurface"]
  on?: Placed["on"]
  wallMount?: Placed["wallMount"]
  kind: FurnitureKind
  /** centre, in tiles */
  x: number
  z: number
  /** size along x and z, in tiles */
  w: number
  d: number
  /** blocks walking */
  solid: boolean
  /** what it is, as the plan names it (floorplan.ts) */
  name?: string
}

export type UnrenderedFurniture = Omit<Furniture, "kind"> & {
  name: string
}

export type Interior = {
  floor: number
  authored?: boolean
  windows?: readonly FramedWindow[]
  lamps?: readonly LampFixture[]
  flues?: readonly FlueSection[]
  shellInset?: number
  doorWidth?: number
  doorHeight?: number
  entrance?: { point: readonly [number, number]; outward: readonly [number, number] }
  wallHeight?: number
  floorThickness?: number
  below?: { drop: number; interior: Interior }
  stairSections?: readonly StairSection[]
  floorOpenings?: readonly { x0: number; z0: number; x1: number; z1: number }[]
  stairBlocks?: readonly { x0: number; z0: number; x1: number; z1: number }[]
  house: HouseDef
  /** the indoor map's id */
  id: string
  /** the floor, in tiles */
  x0: number
  z0: number
  x1: number
  z1: number
  /** the door, on the south wall: step on it to leave */
  door: Cell
  /** where you stand after coming in */
  arrive: Cell
  /** where the shopkeeper stands, behind the counter */
  keeper: Cell
  /** Clothes dried along an entrance-room wall, above the walking floor. */
  drying?: { x: number; z0: number; z1: number }
  /** Source pieces whose shape has no renderer yet; kept separate from rendered collision geometry. */
  unrenderedFurniture: readonly UnrenderedFurniture[]
  furniture: readonly Furniture[]
}

export const INTERIORS: readonly Interior[] = HOUSES.filter(enterable).flatMap((house) =>
  Array.from({ length: house.authored ? floorPlan(house.id).floors : 1 }, (_, floor) => interiorPlan(house, floor)),
)

/** Shops that also sell out front, through the window or from a board by the door: who stands there. */
export const OUT_FRONT: Record<string, string> = { bakery: "ハンス" }
