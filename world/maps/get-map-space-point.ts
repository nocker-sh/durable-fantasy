import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { MapSpace } from "#/world/maps/map-space-types"

type Props = Readonly<{ space: MapSpace; point: readonly [number, number]; heightMetres: number }>

/** Planar coordinates use existing map units; height is explicitly metres above the map's finished floor. */
export function getMapSpacePoint(props: Props): Vector3 {
  const space = props.space
  const frame = getMapSpaceFrame(space)
  return frame.toWorld([(props.point[0] - space.planarOrigin[0]) * space.metresPerPlanarUnit, props.heightMetres, (props.point[1] - space.planarOrigin[1]) * space.metresPerPlanarUnit])
}
