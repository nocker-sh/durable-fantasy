import type { StationRule } from "#/world/core/crafting-types"

/** The stations and what a go at each costs. Where each stands is the town's (town/stations.ts). */
export const STATION_RULES: readonly StationRule[] = [
  { id: "workshop-hearth", kind: "hearth", name: "共同のかまど", fee: 1 },
  { id: "workshop-bench", kind: "workbench", name: "共同の作業台", fee: 2 },
  { id: "workshop-loom", kind: "loom", name: "共同の機織り機と糸車", fee: 2 },
  { id: "craft-forge", kind: "forge", name: "共同の炉", fee: 4 },
]

export const STAMINA_PER_CRAFT = 1
