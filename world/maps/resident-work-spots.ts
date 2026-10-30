import { RESIDENTS } from "#/world/town/residents"
import { workSpot } from "#/world/town/work-spot"
import type { Spot } from "#/world/town/routines"

export const RESIDENT_WORK_SPOTS: ReadonlyMap<string, Spot> = new Map(RESIDENTS.map((resident) => [resident.name, workSpot(resident)]))
