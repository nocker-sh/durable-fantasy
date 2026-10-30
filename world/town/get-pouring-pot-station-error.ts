import { subtractRectangles } from "#/lib/engine/rectangle-subtraction"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
import type { PouringPotLayoutInput, PouringPotStations } from "#/world/town/pouring-pot-layout-types"
type Props = Readonly<{ input: PouringPotLayoutInput; stations: PouringPotStations }>

/** Support the base on iron while reserving clearance for the complete vessel and parked lid. */
export function getPouringPotStationError(props: Props): Error | null {
  const input = props.input,
    stations = props.stations,
    radius = input.profile.dimensions.baseDiameter / 2
  if (!Number.isFinite(radius) || radius <= 0) return new Error("Invalid pouring pot base")
  const base = { x0: stations.heating[0] - radius, x1: stations.heating[0] + radius, z0: stations.heating[2] - radius, z1: stations.heating[2] + radius }
  const contained = (inner: Rectangle, outer: Rectangle) => inner.x0 >= outer.x0 && inner.x1 <= outer.x1 && inner.z0 >= outer.z0 && inner.z1 <= outer.z1
  if (!contained(base, input.plate) || !contained(stations.heated, input.stove) || !contained(stations.rested, stations.area)) return new Error("Pouring pot leaves its heating or resting surface")
  if (
    subtractRectangles(
      stations.area,
      input.masonry.filter((part) => Math.abs(part.top - input.plate.top) <= 1e-9),
    ).length > 0
  )
    return new Error("Hot-pot rest area has no continuous masonry support")
  const overlaps = (a: Rectangle, b: Rectangle) => a.x0 < b.x1 && a.x1 > b.x0 && a.z0 < b.z1 && a.z1 > b.z0
  if (overlaps(stations.heated, stations.area) || overlaps(stations.rested, input.shaft) || overlaps(stations.heated, input.shaft))
    return new Error("Pouring pot stations conflict with the lid or chimney")
  return null
}
