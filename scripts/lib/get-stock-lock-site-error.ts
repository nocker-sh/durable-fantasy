import { z } from "zod"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { stockLockSiteSchema } from "#/scripts/lib/stock-lock-site-schema"
import { getStockLockSiteGeometry } from "#/scripts/lib/get-stock-lock-site-geometry"
import { getStockLockPasturePartition } from "#/scripts/lib/get-stock-lock-pasture-partition"
import { getStockLockSiteGroundErrors } from "#/scripts/lib/get-stock-lock-site-ground-errors"
import { getStockLockMotionRouteError } from "#/scripts/lib/get-stock-lock-motion-route-error"
import { getStockLockWaitingError } from "#/scripts/lib/get-stock-lock-waiting-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{
  document: SettingDocument
  map: string
  pasture: readonly [number, number, number, number]
  metresPerTile: number
  ground: Parameters<typeof getStockLockSiteGroundErrors>[0]["ground"]
}>
const mapSchema = z.object({ map: z.string() })

/** Check the proposed partition against its real map and complete footprint; unreviewed livestock and terrain remain explicit. */
export function getStockLockSiteError(props: Props): Error | null {
  const document = props.document
  if (document.stock_lock_site === undefined) return null
  const plan = stockLockSchema.safeParse(document.stock_lock),
    site = stockLockSiteSchema.safeParse(document.stock_lock_site),
    location = mapSchema.safeParse(document.site)
  if (!plan.success || !site.success || !location.success || location.data.map !== props.map || document.kind !== "facilities" || document.design_gate === "通過")
    return new Error("Invalid proposed stock lock site")
  const geometry = getStockLockSiteGeometry({ plan: plan.data, site: site.data, metresPerTile: props.metresPerTile })
  if (geometry instanceof Error) return geometry
  const partition = getStockLockPasturePartition({ pasture: props.pasture, enclosure: geometry.enclosure, operationFloor: geometry.pasture })
  if (partition instanceof Error) return partition
  const owned = props.ground.obstacles.filter((obstacle) => obstacle.id === "pasture")
  if (owned.length !== 1 || owned[0].rect.some((value, axis) => value !== props.pasture[axis])) return new Error("Stock lock site has no matching grazing reservation")
  if (props.ground.obstacles.some((obstacle) => obstacle.id === `${document.id}/stock-lock` && obstacle.rect.some((value, axis) => value !== geometry.enclosure[axis])))
    return new Error("Stock lock footprint disagrees with its site")
  if (geometry.outside[2] > props.pasture[0] + 1e-9) return new Error("Stock lock outside approach enters the retained pasture")
  const ground = { ...props.ground, obstacles: props.ground.obstacles.filter((obstacle) => obstacle.id !== "pasture" && obstacle.id !== `${document.id}/stock-lock`) },
    errors = getStockLockSiteGroundErrors({ geometry, roadIndex: site.data.road_connection.source_index, ground })
  if (errors.length > 0) return new Error(errors.join("; "))
  const outer = plan.data.walking.paths.find((path) => path.gate === "outer")
  if (!outer) return new Error("Stock lock site has no outside walking anchor")

  const routeError = getStockLockMotionRouteError({ plan: plan.data, gate: "outer", pose: "closed", points: [site.data.road_connection.point_m, outer.points_m[0]] })
  if (routeError) return routeError

  return getStockLockWaitingError({ site: site.data, geometry, map: props.map, pasture: props.pasture, metresPerTile: props.metresPerTile })
}
