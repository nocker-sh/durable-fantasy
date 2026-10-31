import { spotAt } from "#/world/town/spot-at"
import { activityPose } from "#/world/town/activity-pose"
import { places, stalls } from "#/world/scene/construction/registry"
import { shopBoards } from "#/world/scene/dressing"
import { getSceneSpotPosition } from "#/world/scene/runtime/get-scene-spot-position"
import { updateScheduledResident } from "#/world/scene/runtime/update-scheduled-resident"
import { updateScheduledShopFronts } from "#/world/scene/runtime/update-scheduled-shop-fronts"
import type { MapResident } from "#/world/scene/runtime/create-map-residents"
import type { V2 } from "#/world/scene/construction/registry"

type Props = Readonly<{ residents: ReadonlyArray<MapResident>; map: string; centre: V2 }>

/** 人と住民表の番号・仕事場の対応を保ち、その時刻の人物と店先を同期する。 */
export class ScenePopulation {
  readonly people
  readonly ids

  constructor(private readonly props: Props) {
    this.people = Object.freeze(props.residents.map((resident) => resident.actor))
    this.ids = Object.freeze(props.residents.map((resident) => resident.index))
    Object.freeze(this)
  }

  readonly personOf = (id: number) => this.props.residents.find((resident) => resident.index === id)?.actor

  readonly applySchedule = (minute: number): void => {
    const spots = this.props.residents.map((resident) => spotAt(resident.actor.name, minute, resident.work))
    const staffedPlaces = new Set(spots.flatMap((spot) => (spot && "place" in spot && spot.map === this.props.map ? [spot.place] : [])))
    updateScheduledShopFronts({ minute, boards: shopBoards, stalls, staffedPlaces })
    this.props.residents.forEach((resident, index) => {
      const position = getSceneSpotPosition(spots[index], this.props.map, places)
      const pose = position ? activityPose(resident.actor.name, minute, this.props.map) : null
      updateScheduledResident({ actor: resident.actor, position, pose, centre: this.props.centre })
    })
  }
}
