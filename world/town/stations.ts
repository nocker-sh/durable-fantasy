// Where the town's shared work stations stand: the workshop's where its furniture is (interiors.ts),
// the forge in the lane's yard (scene/districts.ts buildCraft). What a station is, what it costs
// and what is made at it is in core/recipes/catalog.ts.
import { STATION_RULES } from "#/world/core/crafting-rules"
import type { Station } from "#/world/core/crafting-types"
import { CRAFT_FORGE_PLACE } from "./craft-yard"
import { INTERIORS } from "#/world/town/interiors"
import { equipmentPlace } from "#/world/town/equipment-place"
import { locateStations } from "#/world/town/locate-stations"
import type { StationPlace } from "#/world/town/station-places"

const PLACES = {
  "workshop-hearth": equipmentPlace({ interiors: INTERIORS, house: "h-c2", kind: "hearth", name: "炉" }),
  "workshop-bench": equipmentPlace({ interiors: INTERIORS, house: "h-c2", kind: "workbench", name: "木工台" }),
  "workshop-loom": equipmentPlace({ interiors: INTERIORS, house: "h-c2", kind: "loom", name: "機織り機" }),
  "craft-forge": CRAFT_FORGE_PLACE,
} satisfies Record<string, StationPlace>

/** The stations, each where it stands. */
export const STATIONS: readonly Station[] = locateStations(STATION_RULES, PLACES)
export const stationAt = (id: string) => STATIONS.find((x) => x.id === id)
