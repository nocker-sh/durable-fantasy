import { z } from "zod"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { stockLockSiteSchema } from "#/scripts/lib/stock-lock-site-schema"
import { getStockLockSiteGeometry } from "#/scripts/lib/get-stock-lock-site-geometry"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const locationSchema = z.object({ map: z.string() })

/** Other buildings and journeys must see the same proposed enclosure even before it is adopted by the game. */
export function getStockLockSiteFootprint(document: SettingDocument, metresPerTile: number) {
  if (document.stock_lock_site === undefined) return null
  const plan = stockLockSchema.safeParse(document.stock_lock),
    site = stockLockSiteSchema.safeParse(document.stock_lock_site),
    location = locationSchema.safeParse(document.site)
  if (!plan.success || !site.success || !location.success || document.kind !== "facilities" || document.design_gate === "通過") return new Error("Invalid proposed stock lock site footprint")
  const geometry = getStockLockSiteGeometry({ plan: plan.data, site: site.data, metresPerTile })
  if (geometry instanceof Error) return geometry

  return { id: `${document.id}/stock-lock`, map: location.data.map, rect: geometry.enclosure }
}
