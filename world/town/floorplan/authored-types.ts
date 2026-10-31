import type { WindowFixture, LampFixture, ActivitySpot } from "#/world/town/room-fixtures"
import type { BuildingEnvelope } from "#/world/town/building-envelope"
import type { StairSection } from "#/world/town/floorplan/stair-geometry"
import type { FurnitureKind } from "#/world/town/furniture-kinds"
import type { Placed, Use, FlueSection } from "#/world/town/floorplan/types"

export type AuthoredRoom = {
  id: string
  name: string
  use: Use
  floor: number
  origin: readonly [number, number]
  rows: readonly string[]
  furniture: readonly {
    symbol: string
    name: string
    kind: FurnitureKind
    cookingTop?: Placed["cookingTop"]
    hearth?: Placed["hearth"]
    hearthFront?: Placed["hearthFront"]
    shelf?: Placed["shelf"]
    bed?: Placed["bed"]
    seat?: Placed["seat"]
    workSurface?: Placed["workSurface"]
    wallMount?: Placed["wallMount"]
    solid: boolean
    rect: readonly [number, number, number, number]
  }[]
}

export type AuthoredPlan = {
  id: string
  /** Known outdoor parent; absent for an unplaced layout preview. */
  parentMap?: string
  exterior?: BuildingEnvelope
  cellM: number
  width: number
  depth: number
  floors: number
  /** Centre of the opening cells, in building grid coordinates. */
  entry: readonly [number, number]
  entrySide: "n" | "s" | "w" | "e"
  entryWidth: number
  entryHeight: number
  rooms: readonly AuthoredRoom[]
  windows: readonly WindowFixture[]
  lamps: readonly LampFixture[]
  activitySpots: readonly ActivitySpot[]
  details: readonly Placed[]
  flues: readonly FlueSection[]
  stairSections: readonly StairSection[]
  floorLevels: readonly { floor: number; elevation: number; ceiling: number; thickness: number }[]
}
