import type { StationKind } from "#/world/core/recipes/definition"

export type Station = {
  id: string
  kind: StationKind
  name: string
  map: string
  cell: readonly [number, number]
  /** what a go costs, paid to the town's 寄り合い */
  fee: number
}

export type StationRule = Omit<Station, "map" | "cell">
