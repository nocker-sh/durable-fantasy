import type { z } from "zod"
import type { stockLockSiteSchema } from "#/scripts/lib/stock-lock-site-schema"
import type { getStockLockSiteGeometry } from "#/scripts/lib/get-stock-lock-site-geometry"
import { getStockLockWaitingCircles } from "#/scripts/lib/get-stock-lock-waiting-circles"
import { townAnimalSpawns } from "#/world/town/animals"
import { pointRectDistance } from "#/lib/engine/point-rect-distance"
type Props = Readonly<{
  site: z.infer<typeof stockLockSiteSchema>
  geometry: Exclude<ReturnType<typeof getStockLockSiteGeometry>, Error>
  map: string
  pasture: readonly [number, number, number, number]
  metresPerTile: number
}>

/** Stationary bodies must fit together in retained grazing land and remain outside every caretaker reservation, at all native headings and grazing tilts. */
export function getStockLockWaitingError(props: Props): Error | null {
  const waiting = props.site.waiting
  const circles = getStockLockWaitingCircles({
    waiting,
    animals: townAnimalSpawns(props.map.replace(/^map-/, "")).filter((animal) => animal.kind === "sheep"),
    origin: [props.pasture[0], props.pasture[1]],
    metresPerTile: props.metresPerTile,
  })
  if (circles instanceof Error) return circles
  const clearance = waiting.clearance_m / props.metresPerTile,
    pasture = props.pasture,
    geometry = props.geometry
  for (const entry of circles.entries()) {
    const circle = entry[1],
      point = circle.centre,
      radius = circle.radius + clearance
    if (point[0] - radius < pasture[0] - 1e-9 || point[1] - radius < pasture[1] - 1e-9 || point[0] + radius > pasture[2] + 1e-9 || point[1] + radius > pasture[3] + 1e-9)
      return new Error(`Stock waiting body leaves the pasture: ${circle.animal}`)
    for (const rect of [geometry.enclosure, geometry.outside, geometry.pasture])
      if (pointRectDistance(point[0], point[1], rect) < radius - 1e-9) return new Error(`Stock waiting body enters a caretaker reservation: ${circle.animal}`)
    for (const other of circles.slice(entry[0] + 1))
      if (Math.hypot(point[0] - other.centre[0], point[1] - other.centre[1]) < circle.radius + other.radius + clearance - 1e-9)
        return new Error(`Stock waiting bodies overlap: ${circle.animal}/${other.animal}`)
  }

  return null
}
