import { siteTransform } from "#/scripts/lib/site-transform"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { auditSiteBounds } from "#/scripts/lib/audit-site-bounds"
type House = { id: string; map: string; x0: number; z0: number; x1: number; z1: number }
type Road = { pts: readonly (readonly number[])[]; w: number }
/** Proposed equipment occupies real ground too, even while its design gate remains pending. */
type Props = {
  doc: SettingDocument
  houses: readonly House[]
  roads: readonly Road[]
  mapTiles: number
  metresPerTile: number
  water: { points: readonly (readonly number[])[]; half_width: number }
  facilities: readonly { id: string; map: string; rect: readonly [number, number, number, number] }[]
}
export function auditFacilityFootprint(props: Props): string[] {
  const doc = props.doc
  const houses = props.houses
  const roads = props.roads
  const mapTiles = props.mapTiles
  const metresPerTile = props.metresPerTile
  const water = props.water
  const facilities = props.facilities

  const site = doc.site as { map: string; rotation_quarters?: number; occupied_rect_tiles?: [number, number, number, number] } | undefined,
    rect = site?.occupied_rect_tiles
  if (!site || !rect) return []
  const errors = auditSiteBounds({ bounds: rect, building: { ...doc, map: site.map }, houses: houses, roads: roads, mapTiles: mapTiles, label: "Facility footprint" })
  if (doc.grid) {
    if (!Number.isFinite(metresPerTile) || metresPerTile <= 0) errors.push("Invalid facility metre-to-tile scale")
    else {
      const sizeSource = siteTransform(doc.grid.rows[0].length * doc.grid.cell_m, doc.grid.rows.length * doc.grid.cell_m, site.rotation_quarters ?? 0),
        size = sizeSource.size
      if (Math.abs((rect[2] - rect[0]) * metresPerTile - size[0]) > 1e-6 || Math.abs((rect[3] - rect[1]) * metresPerTile - size[1]) > 1e-6)
        errors.push("Facility footprint disagrees with its grid dimensions")
    }
  }
  for (const other of facilities)
    if (other.id !== doc.id && other.map === site.map && rect[0] < other.rect[2] && other.rect[0] < rect[2] && rect[1] < other.rect[3] && other.rect[1] < rect[3])
      errors.push(`Facility footprint overlaps ${other.id}`)
  if (water.points.slice(1).some((point, i) => segmentRectDistance(rect, water.points[i], point) < water.half_width)) errors.push("Facility footprint covers water")
  return [...new Set(errors)]
}
