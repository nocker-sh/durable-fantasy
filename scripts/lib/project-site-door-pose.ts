import type { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { getGridBoundaryOpening } from "#/scripts/lib/get-grid-boundary-opening"
import type { SiteDoorPose } from "#/scripts/lib/site-door-pose-types"

type Props = Readonly<{ frame: SpatialFrame; opening: NonNullable<ReturnType<typeof getGridBoundaryOpening>>; local: Vector3; siteOrigin: readonly number[]; openingWidth: number }>

/** Positions and the rotated site outline use the same frame; this projection may reject unbounded coordinates. */
export function projectSiteDoorPose(props: Props): SiteDoorPose | undefined {
  const point = props.frame.toWorld(props.local),
    outward = props.frame.direction([props.opening.outward[0], 0, props.opening.outward[1]])
  const bounds: SiteDoorPose["bounds"] = [props.siteOrigin[0], props.siteOrigin[1], props.siteOrigin[0] + props.frame.size[0], props.siteOrigin[1] + props.frame.size[1]]
  if (!bounds.every(Number.isFinite)) return undefined
  return { point: [point[0], point[2]], outward: [outward[0], outward[2]], width_m: props.openingWidth, bounds }
}
