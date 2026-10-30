import { z } from "zod"
import { getWindmillRoadApproach } from "#/scripts/lib/get-windmill-road-approach"
import type { Road } from "#/world/maps/layout-types"
import { windmillYardSiteSchema } from "#/scripts/lib/windmill-yard-site-schema"
import { auditWindmillYard } from "#/scripts/lib/audit-windmill-yard"
import { getWindmillYardSiteGeometry } from "#/scripts/lib/get-windmill-yard-site-geometry"
import { getWindmillFieldPartition } from "#/scripts/lib/get-windmill-field-partition"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
const locationSchema = z.object({ map: z.string().startsWith("map-"), status: z.literal("proposed") })
type Props = Readonly<{ document: SettingDocument; fields: readonly Rectangle[]; roads?: readonly Road[]; metresPerTile: number }>

/** A registered site study never changes the rendered location, crop inventory or the facility's unfinished gate. */
export function getWindmillYardSiteReview(props: Props) {
  const document = props.document
  if (document.windmill_yard_site === undefined) return null
  const site = windmillYardSiteSchema.safeParse(document.windmill_yard_site),
    location = locationSchema.safeParse(document.site)
  if (!site.success || !location.success || document.kind !== "facilities" || !document.grid || document.design_gate === "通過") return new Error("Invalid proposed windmill site")
  const yardErrors = auditWindmillYard(document)
  if (yardErrors.length) return new Error(yardErrors.join("; "))
  const field = props.fields[site.data.field_index]
  if (!field) return new Error("Windmill site has no nominated source field")
  const geometry = getWindmillYardSiteGeometry({ grid: document.grid, site: site.data, metresPerTile: props.metresPerTile })
  if (geometry instanceof Error) return geometry
  const approach = getWindmillRoadApproach({ grid: document.grid, site: site.data, roads: props.roads ?? [], metresPerTile: props.metresPerTile })
  if (approach instanceof Error) return approach
  const partition = getWindmillFieldPartition({ field, bounds: geometry.bounds, additionalBounds: approach?.bounds, metresPerTile: props.metresPerTile })
  if (partition instanceof Error) return partition
  const fieldRect = [field.x0, field.z0, field.x1, field.z1] satisfies readonly [number, number, number, number]
  return { footprint: { id: document.id, map: location.data.map, rect: geometry.bounds }, sourceFieldId: `field-${site.data.field_index + 1}`, fieldRect, partition, approach }
}
