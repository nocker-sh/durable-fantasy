export type Side = "n" | "e" | "s" | "w"

export type Square = {
  /** column (west to east) and row (north to south) */
  at: readonly [number, number]
  /** the map here, or a city not built yet */
  map?: string
  city?: string
  /** sides nothing crosses */
  walls?: readonly Side[]
}
