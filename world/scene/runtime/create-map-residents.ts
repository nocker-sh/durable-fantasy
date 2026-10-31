import { RESIDENTS } from "#/world/town/residents"
import { ROUTINES } from "#/world/town/routines"
import { spotAt } from "#/world/town/spot-at"
import { workSpot } from "#/world/town/work-spot"
import { places } from "#/world/scene/construction/registry"
import { createResidentActor } from "#/world/scene/runtime/create-resident-actor"
import { getSceneSpotPosition } from "#/world/scene/runtime/get-scene-spot-position"
import type { Actor } from "#/world/scene/actor"
import type { Spot } from "#/world/town/routine-types"

type Props = Omit<Parameters<typeof createResidentActor>[0], "index" | "position"> & Readonly<{ map: string }>
export type MapResident = Readonly<{ index: number; actor: Actor; work: Spot }>

/** 一日のどこかでこのマップへ来る人だけを、住民表の順に取得する。 */
export function createMapResidents(props: Props): ReadonlyArray<MapResident> {
  const residents: MapResident[] = []
  for (const entry of RESIDENTS.entries()) {
    const index = entry[0]
    const resident = entry[1]
    const work = workSpot(resident)
    const here = (ROUTINES[resident.name] ?? []).map((slot) => spotAt(resident.name, slot.from, work)).find((spot) => spot?.map === props.map)
    const position = getSceneSpotPosition(here ?? null, props.map, places)
    if (!position) continue
    const actor = createResidentActor({ ...props, index, position })
    residents.push({ index, actor, work })
  }
  return residents
}
