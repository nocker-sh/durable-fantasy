import * as THREE from "three"
import type { HouseStyle } from "#/world/town/style"
import type { V2 } from "#/world/scene/construction/registry"

export const glowOwner: { value: string | null } = { value: null }

// ---------------------------------------------------------------- houses
export type HouseOpts = {
  x0: number
  z0: number
  x1: number
  z1: number
  floors: number
  axis: "x" | "z"
  roof: "roof" | "roof2" | "slate" | "thatch"
  door: { side: "n" | "s" | "e" | "w"; u: number }
  seed: number
  timber?: boolean
  chimney?: boolean
  sign?: string
  name?: string
  ramp?: string
  /** a home you cannot go into: drawn solid, never faded to show what is inside */
  private?: boolean
  /** how it looks, from who lives there (town/style.ts) */
  style?: HouseStyle
  opening?: "n" | "s" | "e" | "w"
}

export const oriels: string[] = []

export type Side = "n" | "s" | "e" | "w"

export const SIDE: Record<Side, { n: V2; t: V2 }> = {
  s: { n: [0, 1], t: [1, 0] },
  n: { n: [0, -1], t: [-1, 0] },
  e: { n: [1, 0], t: [0, -1] },
  w: { n: [-1, 0], t: [0, 1] },
}

export const leanTos: string[] = []

export const roofCache = new Map<string, THREE.MeshLambertMaterial>()
