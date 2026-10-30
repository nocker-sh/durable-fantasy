import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditSiteBounds } from "#/scripts/lib/audit-site-bounds"
import { roofBounds } from "#/scripts/lib/roof-bounds"

type Props = {
  building: SettingDocument
  houses: readonly { id: string; map: string; x0: number; z0: number; x1: number; z1: number }[]
  metresPerTile: number
  roads: readonly { pts: readonly (readonly number[])[]; w: number }[]
  mapTiles: number
}

export function auditRoofSite(props: Props): string[] {
  const bounds = roofBounds(props.building, props.metresPerTile)
  return bounds ? auditSiteBounds({ bounds: bounds, building: props.building, houses: props.houses, roads: props.roads, mapTiles: props.mapTiles, label: "Roof overhang" }) : []
}
