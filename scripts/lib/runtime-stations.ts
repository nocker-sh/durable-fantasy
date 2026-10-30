import type { Station } from "#/world/core/crafting-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"
/** A facility's reference to playable equipment must survive map and station-definition changes. */
export function auditRuntimeStations(documents: ReadonlyMap<string, SettingDocument>, stations: readonly Station[]): string[] {
  const errors: string[] = [],
    claimed = new Set<string>()
  for (const doc of documents.values()) {
    if (doc.runtime_station === undefined) continue
    const station = stations.find((station) => station.id === doc.runtime_station)
    if (doc.kind !== "facilities") errors.push(`${doc.id}: runtime station belongs to a facility`)
    if (!station) {
      errors.push(`${doc.id}: runtime station does not exist`)
      continue
    }
    if (claimed.has(station.id)) errors.push(`${doc.id}: runtime station is assigned to more than one facility`)
    claimed.add(station.id)
    const site = doc.site as { map?: string } | undefined
    if (site?.map !== `map-${station.map}`) errors.push(`${doc.id}: facility site disagrees with its runtime station map`)
    if (!((doc.design_dependencies ?? []) as string[]).includes(`map-${station.map}`)) errors.push(`${doc.id}: runtime station map is missing from design dependencies`)
  }
  return errors
}
