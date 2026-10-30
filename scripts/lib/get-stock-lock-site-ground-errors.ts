import { getOutdoorReservationErrors } from "#/scripts/lib/get-outdoor-reservation-errors"
import type { getStockLockSiteGeometry } from "#/scripts/lib/get-stock-lock-site-geometry"
type Props = Readonly<{ geometry: Exclude<ReturnType<typeof getStockLockSiteGeometry>, Error>; roadIndex: number; ground: Omit<Parameters<typeof getOutdoorReservationErrors>[0], "bounds"> }>

/** Only the named terminal road may occupy the outside approach; every road still avoids the enclosure and inner operating floor. */
export function getStockLockSiteGroundErrors(props: Props): readonly string[] {
  const geometry = props.geometry,
    roadId = `road-${props.roadIndex + 1}`,
    road = props.ground.corridors.find((corridor) => corridor.id === roadId),
    point = geometry.connection
  if (!road || !road.points.at(-1)?.every((value, axis) => Math.abs(value - point[axis]) < 1e-9)) return ["Stock lock has no matching terminal road"]
  if (
    !Number.isFinite(road.halfWidth) ||
    road.halfWidth <= 0 ||
    point[0] - road.halfWidth < geometry.outside[0] - 1e-9 ||
    point[1] - road.halfWidth < geometry.outside[1] - 1e-9 ||
    point[0] + road.halfWidth > geometry.outside[2] + 1e-9 ||
    point[1] + road.halfWidth > geometry.outside[3] + 1e-9
  )
    return ["Stock lock outside floor does not contain the full road terminal"]
  const ground = props.ground,
    errors: string[] = []
  for (const bounds of [geometry.enclosure, geometry.pasture]) errors.push(...getOutdoorReservationErrors({ ...ground, bounds }))
  errors.push(...getOutdoorReservationErrors({ ...ground, bounds: geometry.outside, corridors: ground.corridors.filter((corridor) => corridor.id !== roadId) }))

  return errors
}
