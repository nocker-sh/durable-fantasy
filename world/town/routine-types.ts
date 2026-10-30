import type { Cell } from "#/world/maps/types"

/** A spot: a named place on a map (scene `places`, exported to the map JSON), a tile position, or a cell. */
export type Spot = { map: string; place: string } | { map: string; tile: readonly [number, number] } | { map: string; cell: Cell }

/** Where someone is in a stretch of the day: at work, somewhere else, or at home out of sight. */
export type Where = "work" | "home" | "tavern" | "inn" | Spot

export type RoutineActivity = { kind: "lesson"; role: "student" | "teacher" } | { kind: "records" }

export type Slot = {
  from: number
  where: Where
  doing: string
  activity?: RoutineActivity
}
