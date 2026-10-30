import type { SettingDocument } from "#/scripts/lib/setting-document"
/** Existing equipment references actual map places; a proposed site stays explicitly unresolved. */
export function auditFacilitySite(document: SettingDocument, maps: Readonly<Record<string, { places: Readonly<Record<string, unknown>> }>>): string[] {
  const site = document.site as { map?: string; place?: string; status?: string; occupied_rect_tiles?: number[] } | undefined
  if (!site || typeof site.map !== "string" || !site.map.startsWith("map-")) return ["Missing facility map"]
  const footprint = site.occupied_rect_tiles
  if (footprint !== undefined && (!Array.isArray(footprint) || footprint.length !== 4 || footprint.some((n) => !Number.isFinite(n)) || footprint[0] >= footprint[2] || footprint[1] >= footprint[3]))
    return ["Invalid facility footprint"]
  const map = maps[site.map.slice(4)]
  if (!map) return ["Facility map does not exist"]
  if (site.status === "proposed") return document.design_gate === "通過" ? ["Unresolved facility placement cannot pass design gate"] : []
  if (typeof site.place !== "string" || !Object.hasOwn(map.places, site.place)) return ["Facility place does not exist on map"]
  return []
}
