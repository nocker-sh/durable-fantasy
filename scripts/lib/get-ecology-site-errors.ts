import { getEcologyGridErrors } from "#/scripts/lib/get-ecology-grid-errors"
import { getEcologyFeatureErrors } from "#/scripts/lib/get-ecology-feature-errors"
import { getEcologyAccessErrors } from "#/scripts/lib/get-ecology-access-errors"
import type { EcologySite } from "#/scripts/lib/ecology-zone-schema"
import type { MonsterKind } from "#/world/core/monster-types"
import type { MapDefinition } from "#/world/maps/types"
type Props = { site: EcologySite; map: MapDefinition; kind: MonsterKind }
/** Grid and approach checks do not promote a terrain or hydrology proposal to completed ecological design. */
export function getEcologySiteErrors(props: Props): string[] {
  const errors = getEcologyGridErrors(props)
  if (errors.length) return errors
  const symbols = new Set<string>(),
    ids = new Set<string>()
  for (const feature of props.site.features) {
    if (symbols.has(feature.symbol) || ids.has(feature.id)) errors.push("Habitat feature identities overlap")
    symbols.add(feature.symbol)
    ids.add(feature.id)
    errors.push(...getEcologyFeatureErrors({ feature, grid: props.site.grid }))
  }
  for (const role of ["food", "water", "rest", "escape"]) if (!props.site.features.some((feature) => feature.role === role)) errors.push(`Habitat omits ${role}`)
  if (!errors.length) errors.push(...getEcologyAccessErrors(props))
  return errors
}
