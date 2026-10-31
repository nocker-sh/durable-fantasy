import { checkedVector3 } from "#/lib/engine/checked-vector3"
import { MAPS } from "#/world/maps"
import { WR } from "#/world/maps/ground/rules"
import { walkable } from "#/world/maps/walkable"
import { getMapWorldPoint } from "#/world/maps/get-map-world-point"
import type { MapSpaceRegistry, MapWorldPoint } from "#/world/maps/map-space-types"
import type { MapWalkSampler } from "#/world/maps/ground/types"
import type { Cell } from "#/world/maps/types"

type Props = Readonly<{ maps: MapSpaceRegistry; mapId: string; cell: Cell; walk: MapWalkSampler }>

/** Project a real walk cell's centre and surface height; indoor display floor offsets are removed exactly once. */
export function getMapCellWorldPoint(props: Props): MapWorldPoint | null {
  const map = Object.hasOwn(MAPS, props.mapId) ? MAPS[props.mapId] : undefined
  if (!map || map.id !== props.mapId || props.walk.mapId !== props.mapId || !walkable(map, props.cell)) throw new Error(`Invalid world-position walk cell: ${props.mapId}`)
  const x = (props.cell[0] + 0.5) / WR,
    z = (props.cell[1] + 0.5) / WR,
    base = getMapWorldPoint({ maps: props.maps, mapId: props.mapId, point: [x, z], heightMetres: 0 }),
    space = props.maps[props.mapId].space
  if (!base || !space) return null
  const displayHeight = props.walk.sample(x, z)
  if (!Number.isFinite(displayHeight) || !Number.isFinite(props.walk.displayFloorHeight)) throw new RangeError("Invalid world-position surface height")
  const height = (displayHeight - props.walk.displayFloorHeight) * space.metresPerPlanarUnit
  return { rootSpace: base.rootSpace, point: checkedVector3([base.point[0], base.point[1] + height, base.point[2]], "Invalid world-position surface height") }
}
