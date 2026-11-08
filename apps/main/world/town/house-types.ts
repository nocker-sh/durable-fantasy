import type { ShopId } from "#/world/core/shop-types"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
export type HouseKind = "home" | "shop" | "public" | "workshop" | "farm" | "vacant"

export type Room = {
  name: string
  floor: number
  /** beds in the room */
  beds?: number
}

export type Plan = {
  rooms: readonly Room[]
  /** every lived-in building has one, so its chimney smokes */
  hearth: boolean
  /** a kitchen (or a cooking corner at the hearth) */
  kitchen: boolean
  /** what the trade needs on the ground floor or in the yard */
  workshop?: string
  furniture: readonly string[]
}

export type HouseDef = {
  authored?: AuthoredPlan
  id: string
  map: string
  kind: HouseKind
  name: string
  /** the household living here, if any */
  household?: string
  /** the shop on the ground floor (world/core/shops.ts) */
  shop?: ShopId
  // the outside, as house() in scene/build.ts draws it
  x0: number
  z0: number
  x1: number
  z1: number
  axis: "x" | "z"
  roof: "roof" | "roof2" | "slate" | "thatch"
  door: { side: "n" | "s" | "e" | "w"; u: number }
  seed: number
  timber?: boolean
  sign?: string
  ramp?: string
  opening?: "n" | "s" | "e" | "w"
  plan: Plan
}

export type Household = {
  id: string
  name: string
  /** resident names (world/scene/residents.ts) */
  members: readonly string[]
  living: "慎ましい" | "ふつう" | "ゆとりがある"
  /** how they earn their keep and where food and fuel come from */
  trade: string
}
