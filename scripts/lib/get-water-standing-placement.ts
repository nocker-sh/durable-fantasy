import { FIG } from "#/world/scene/figure/display-scale"
import { getWellPlace } from "#/world/town/get-well-place"
import type { WaterLandingBodyReview } from "#/scripts/lib/water-landing-body-schema"
import type { WaterLanding } from "#/scripts/lib/water-landing-schema"
type Props = { landing: WaterLanding; placement: WaterLandingBodyReview["placements"][number]; anchorTiles: readonly [number, number]; metresPerTile: number }

/** Empty and loaded native poses use the same authored floor, standing point, heading and outdoor scale. */
export function getWaterStandingPlacement(props: Props) {
  const zone = props.landing.zones.find((zone) => zone.symbol === props.placement.zone)
  if (!zone) return new Error("Water body placement has no matching zone")
  const anchorX = props.anchorTiles[0] * props.metresPerTile,
    anchorZ = props.anchorTiles[1] * props.metresPerTile,
    origin = props.landing.origin_m,
    cell = props.landing.cell_m
  const area: [number, number, number, number] = [
    anchorX + origin[0] + zone.rect[0] * cell,
    anchorZ + origin[1] + zone.rect[1] * cell,
    anchorX + origin[0] + (zone.rect[0] + zone.rect[2]) * cell,
    anchorZ + origin[1] + (zone.rect[1] + zone.rect[3]) * cell,
  ]
  const at = props.placement.position,
    point = at.kind === "native_well_place" ? getWellPlace(props.anchorTiles, at.place) : null
  const position: [number, number] = point ? [point[0] * props.metresPerTile, point[1] * props.metresPerTile] : at.kind === "relative_m" ? [anchorX + at.point[0], anchorZ + at.point[1]] : [NaN, NaN]

  return { area, position, heading: (props.placement.heading_quarters * Math.PI) / 2, scale: FIG * props.metresPerTile }
}
