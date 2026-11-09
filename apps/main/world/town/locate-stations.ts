import type { Station, StationRule } from "#/world/core/crafting-types"
import type { StationPlace } from "#/world/town/station-places"

/** A crafting rule without a usable place is a broken world definition, not an available station. */
export function locateStations(rules: readonly StationRule[], places: Readonly<Record<string, StationPlace | undefined>>): readonly Station[] {
  const ids = new Set<string>()
  return rules.map((rule) => {
    if (ids.has(rule.id)) throw new Error(`Duplicate crafting station: ${rule.id}`)
    ids.add(rule.id)
    const place = places[rule.id]
    if (!place || !place.map || place.cell.length !== 2 || place.cell.some((value) => !Number.isSafeInteger(value) || value < 0)) throw new Error(`Crafting station has no valid place: ${rule.id}`)
    return { ...rule, ...place }
  })
}
