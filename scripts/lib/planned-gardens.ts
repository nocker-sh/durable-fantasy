import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { LandRect, ReservedLand } from "#/scripts/lib/land-use"

/** Planned garden documents replace their source plot, never the runtime ground data. */
export function plannedGardens(documents: ReadonlyMap<string, SettingDocument>, map: string, gardens: readonly LandRect[]): { areas: ReservedLand[]; errors: string[] } {
  const areas: ReservedLand[] = gardens.map((r, i) => ({ id: `garden-${i + 1}`, rect: [r.x0, r.z0, r.x1, r.z1] })),
    errors: string[] = [],
    replaced = new Set<number>()
  for (const doc of documents.values()) {
    const feature = doc.ground_feature as { kind: string; index: number; source_rect_tiles: number[] } | undefined
    if (!feature) continue
    const site = doc.site as { map: string; occupied_rect_tiles?: number[] } | undefined
    if (site?.map !== map) continue
    if (doc.kind !== "facilities" || feature.kind !== "garden" || !Number.isSafeInteger(feature.index) || !gardens[feature.index] || !site.occupied_rect_tiles) {
      errors.push(`${doc.id}: garden has no matching source plot or footprint`)
      continue
    }
    const original = gardens[feature.index],
      sourceRect = [original.x0, original.z0, original.x1, original.z1]
    if (!Array.isArray(feature.source_rect_tiles) || feature.source_rect_tiles.length !== 4 || sourceRect.some((n, i) => Math.abs(n - feature.source_rect_tiles[i]) > 1e-6)) {
      errors.push(`${doc.id}: source garden geometry changed`)
      continue
    }
    if (replaced.has(feature.index)) {
      errors.push(`${doc.id}: source garden is replaced more than once`)
      continue
    }
    replaced.add(feature.index)
    const mapDoc = documents.get(map)
    if (!(mapDoc?.facilities as string[] | undefined)?.includes(doc.id)) errors.push(`${doc.id}: garden is missing from its map inventory`)
    const source = gardens[feature.index],
      rect = site.occupied_rect_tiles as [number, number, number, number]
    if ((rect[2] - rect[0]) * (rect[3] - rect[1]) + 1e-9 < (source.x1 - source.x0) * (source.z1 - source.z0)) errors.push(`${doc.id}: replacement loses existing garden area`)
    areas[feature.index] = { id: doc.id, rect }
  }
  return { areas, errors }
}
