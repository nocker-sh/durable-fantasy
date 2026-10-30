import { getEcologySiteErrors } from "#/scripts/lib/get-ecology-site-errors"
import type { EcologyPlacement } from "#/scripts/lib/ecology-zone-schema"
import type { MonsterKind } from "#/world/core/monster-types"
import type { MapDefinition } from "#/world/maps/types"
type Props = { placement: EcologyPlacement; map: MapDefinition; kind: MonsterKind }
/** Disjoint sites keep their own ground and paths; no route across undesigned land is implied. */
export function getEcologyPlacementErrors(props: Props): string[] {
  const errors: string[] = [],
    ids = new Set<string>()
  for (const site of props.placement.sites) {
    if (ids.has(site.id)) errors.push(`Duplicate habitat site ${site.id}`)
    ids.add(site.id)
    errors.push(...getEcologySiteErrors({ site, map: props.map, kind: props.kind }).map((message) => `${site.id}: ${message}`))
  }
  return errors
}
