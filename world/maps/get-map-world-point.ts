import { getMapSpacePoint } from "#/world/maps/get-map-space-point"
import { getMapSpaceTransform } from "#/world/maps/get-map-space-transform"
import { WORLD_SPACE_ROOT } from "#/world/maps/world-space-rules"
import type { MapSpaceRegistry, MapWorldPoint } from "#/world/maps/map-space-types"

type Props = Readonly<{ maps: MapSpaceRegistry; mapId: string; point: readonly [number, number]; heightMetres: number }>

/** Convert display units once, then compose metric parents; unplaced maps never receive a fictitious world origin. */
export function getMapWorldPoint(props: Props): MapWorldPoint | null {
  const map = Object.hasOwn(props.maps, props.mapId) ? props.maps[props.mapId] : undefined
  if (!map || map.id !== props.mapId) throw new Error(`Map space parent is missing or miskeyed: ${props.mapId}`)
  if (!map.space) return null
  const point = getMapSpacePoint({ space: map.space, point: props.point, heightMetres: props.heightMetres }),
    parent = getMapSpaceTransform(props.maps, map.space.parentMap)
  if (parent.rootSpace !== WORLD_SPACE_ROOT) return null
  return { rootSpace: parent.rootSpace, point: parent.transform.toWorld(point) }
}
