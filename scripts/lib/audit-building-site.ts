import type { SettingDocument } from "#/scripts/lib/setting-document"
import { siteTransform } from "#/scripts/lib/site-transform"
import type { Rect, ExistingHouse, SiteCheck } from "#/scripts/lib/building-site"
import { auditSiteBounds } from "#/scripts/lib/audit-site-bounds"

/** Metres in room drawings become outdoor tiles; indoor presentation magnification is never used. */
type Props = {
  building: SettingDocument
  houses: readonly ExistingHouse[]
  metresPerTile: number
  roads: readonly { pts: readonly (readonly number[])[]; w: number }[]
  mapTiles?: number
}

export function auditBuildingSite(props: Props): SiteCheck {
  const mapTiles = props.mapTiles === undefined ? 48 : props.mapTiles

  if (!Number.isFinite(mapTiles) || mapTiles <= 0) return { problems: ["Invalid outdoor map size"] }
  const site = props.building.site_plan as { origin?: number[]; rotation_quarters?: number; status?: string; unresolved?: unknown[] } | undefined
  const layout = props.building.layout as { width: number; depth: number; cell_m: number } | undefined
  if (!site || !layout) return { problems: ["Building has no outdoor site plan"] }
  if (
    !Array.isArray(site.origin) ||
    site.origin.length !== 2 ||
    site.origin.some((n) => !Number.isFinite(n)) ||
    ![0, 1, 2, 3].includes(Number(site.rotation_quarters)) ||
    !Number.isFinite(props.metresPerTile) ||
    props.metresPerTile <= 0
  )
    return { problems: ["Invalid outdoor site transform"] }
  const width = (layout.width * layout.cell_m) / props.metresPerTile,
    depth = (layout.depth * layout.cell_m) / props.metresPerTile
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(depth) || depth <= 0) return { problems: ["Invalid outdoor footprint size"] }
  const sizeSource = siteTransform(width, depth, site.rotation_quarters!),
    size = sizeSource.size
  const bounds: Rect = [site.origin[0], site.origin[1], site.origin[0] + size[0], site.origin[1] + size[1]]
  const problems: string[] = []
  if (props.building.design_gate === "通過" && (site.status !== "designed" || !!site.unresolved?.length)) problems.push("Outdoor site plan is not finalized")
  problems.push(...auditSiteBounds({ bounds: bounds, building: props.building, houses: props.houses, roads: props.roads, mapTiles: mapTiles }))
  return { bounds, problems }
}
