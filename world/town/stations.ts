// Where the town's shared work stations stand: the workshop's where its furniture is (interiors.ts),
// the forge in the lane's yard (scene/districts.ts buildCraft). What a station is, what it costs
// and what is made at it is in core/crafting.ts.
import { STATION_RULES, type Station } from "../core/crafting.ts"
import { INTERIORS } from "./interiors.ts"

const workshop = INTERIORS.find((i) => i.house.id === "h-c2")!
const at = (kind: string): readonly [number, number] => {
  const f = workshop.furniture.find((x) => x.kind === kind)!
  return [Math.floor(f.x * 2), Math.floor(f.z * 2)]
}
const PLACES: Record<string, { map: string; cell: readonly [number, number] }> = {
  "workshop-hearth": { map: workshop.id, cell: at("hearth") },
  "workshop-bench": { map: workshop.id, cell: at("workbench") },
  "workshop-loom": { map: workshop.id, cell: at("loom") },
  "craft-forge": { map: "phanthiet-craft", cell: [33, 52] },
}

/** The stations, each where it stands. */
export const STATIONS: readonly Station[] = STATION_RULES.map((s) => ({ ...s, ...PLACES[s.id] }))
export const stationAt = (id: string) => STATIONS.find((x) => x.id === id)
