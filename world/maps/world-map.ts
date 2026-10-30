// The world map (ui.md §3.3) drawn from the world grid (grid.ts): each map at the middle of its
// square in a 100×100 field, north up; the lines between them are the ways across. Cities beyond
// their gates hold squares too, drawn but not entered yet.
import type { WorldNode } from "#/world/maps/world-map-types"
import { GRID_SIZE, STEP, WORLD } from "#/world/maps/grid"
import { squareAt } from "#/world/maps/square-at"
import { type Side } from "#/world/maps/grid-types"

const pos = (at: readonly [number, number]) => ({ x: ((at[0] + 0.5) * 100) / GRID_SIZE.cols, y: ((at[1] + 0.5) * 100) / GRID_SIZE.rows })

/** The town's squares carry its name. */
const CITY: Record<string, string> = { phanthiet: "ファンティエット" }

export const WORLD_NODES: readonly WorldNode[] = WORLD.filter((s) => s.map).map((s) => ({ id: s.map!, ...pos(s.at), ...(CITY[s.map!.split("-")[0]] ? { city: CITY[s.map!.split("-")[0]] } : {}) }))

/** Cities not built yet, and the map at their gate. */
export const LOCKED_CITIES: readonly { name: string; x: number; y: number; from: string }[] = WORLD.filter((s) => s.city).map((s) => {
  const gate = (["n", "e", "s", "w"] as Side[]).map((d) => squareAt(s.at[0] + STEP[d][0], s.at[1] + STEP[d][1])).find((o) => o?.map?.endsWith("-gate"))
  return { name: s.city!, ...pos(s.at), from: gate?.map ?? "" }
})
