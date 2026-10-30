import { z } from "zod"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { stockLockSiteSchema } from "#/scripts/lib/stock-lock-site-schema"
import { getStockLockSiteGeometry } from "#/scripts/lib/get-stock-lock-site-geometry"
import { TILE_M } from "#/world/town/fit"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ facility: SettingDocument | null; point: readonly [number, number]; map: string; roadIndex: number }>
const mapSchema = z.object({ map: z.string() })

/** Bind a terminal branch to the same facility's projected approach, not an arbitrary named point. */
export function getStockLockRoadAttachmentError(props: Props): Error | null {
  const facility = props.facility,
    location = mapSchema.safeParse(facility?.site),
    site = stockLockSiteSchema.safeParse(facility?.stock_lock_site),
    plan = stockLockSchema.safeParse(facility?.stock_lock)
  if (
    facility?.kind !== "facilities" ||
    facility.design_gate === "通過" ||
    !location.success ||
    location.data.map !== props.map ||
    !site.success ||
    !plan.success ||
    site.data.road_connection.source_index !== props.roadIndex
  )
    return new Error("Road plan endpoint has no stock lock approach")
  const geometry = getStockLockSiteGeometry({ plan: plan.data, site: site.data, metresPerTile: TILE_M })
  if (geometry instanceof Error || geometry.connection.some((value, axis) => Math.abs(value - props.point[axis]) > 1e-9)) return new Error("Road plan endpoint has no stock lock approach")

  return null
}
