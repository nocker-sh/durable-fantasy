export type Cell = readonly [number, number]

export type Warp = {
  /** stand on this cell to warp */
  at: Cell
  /** map id (see MAPS) and arrival cell */
  to: { map: string; at: Cell }
}

export type MapDefinition = {
  id: string
  name: string
  kind: "town" | "indoor" | "field" | "dungeon"
  /** walk grid cells along one side */
  size: number
  /** rows of '#' (blocked) and '.' (free) */
  rows: readonly string[]
  /** who stands here at some hour of the day, at their usual spot (npcsAt gives who is here now) */
  npcs: readonly { name: string; cell: Cell }[]
  /** named spots (scene `places`, exported with the grid), in cells */
  places: Readonly<Record<string, Cell>>
  warps: readonly Warp[]
  /** where players appear when they log in here or come back after dying */
  spawn: Cell
  /** browser-only assets: the scene module and baked resident sprites */
  assets: { sprites: string }
}

export type MapId = string
