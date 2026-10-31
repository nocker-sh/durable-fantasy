import { NODES } from "#/world/core/gather"
import { STATIONS } from "#/world/town/stations"
import { EXCHANGE_BOARD } from "#/world/town/boards"
import { createGatheringNode } from "#/world/scene/runtime/create-gathering-node"
import { createStationSpot } from "#/world/scene/runtime/create-station-spot"
import type { Group, Object3D, Raycaster } from "three"
import type { GatheringSpot } from "#/world/scene/runtime/gathering-types"

type Props = Readonly<{ town: Group; map: string }>

/** 描画ごとの資源と設備を保持し、残量の表示とクリックを同じ対象へ結ぶ。 */
export class SceneGathering {
  private readonly entries: ReadonlyMap<string, GatheringSpot>

  constructor(private readonly props: Props) {
    this.entries = new Map([
      ...NODES.filter((node) => node.map === this.props.map).map((node): [string, GatheringSpot] => [node.id, createGatheringNode(this.props.town, node)]),
      ...[...STATIONS, { id: "exchange-board", map: EXCHANGE_BOARD.map, cell: EXCHANGE_BOARD.cell }]
        .filter((station) => station.map === this.props.map)
        .map((station): [string, GatheringSpot] => [`station:${station.id}`, createStationSpot(this.props.town, station)]),
    ])
    Object.freeze(this)
  }

  get spots(): ReadonlyMap<string, Pick<GatheringSpot, "at">> {
    return this.entries
  }

  readonly setNodes = (left: Readonly<Record<string, number>>): void => {
    for (const entry of this.entries) {
      if (entry[0].startsWith("station:")) continue
      const has = (left[entry[0]] ?? 1) > 0
      entry[1].full.visible = has
      entry[1].spent.visible = !has
    }
  }

  readonly spotHit = (ray: Pick<Raycaster, "intersectObjects">): string | null => {
    const hits = ray.intersectObjects(
      [...this.entries.values()].filter((spot) => spot.full.visible).map((spot) => spot.full),
      true,
    )
    const cursor: { object: Object3D | null } = { object: hits[0]?.object ?? null }
    while (cursor.object) {
      const tag: unknown = cursor.object.userData.node
      if (typeof tag === "string" && tag) return tag
      cursor.object = cursor.object.parent
    }
    return null
  }
}
