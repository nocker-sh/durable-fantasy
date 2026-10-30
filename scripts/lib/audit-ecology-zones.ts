import { getEcologyTerritoryErrors } from "#/scripts/lib/get-ecology-territory-errors"
import { ecologyZonesSchema } from "#/scripts/lib/ecology-zone-schema"
import { getEcologyPlacementErrors } from "#/scripts/lib/get-ecology-placement-errors"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { MonsterKind, Spawn } from "#/world/core/monster-types"
import type { MapDefinition } from "#/world/maps/types"
type Props = { document: SettingDocument; map: MapDefinition; kinds: ReadonlyMap<string, MonsterKind>; spawns: ReadonlyArray<Spawn> }
/** Every registered species needs one explicit habitat entry; null or proposed placement cannot clear the map design gate. */
export function auditEcologyZones(props: Props): string[] {
  const expectedSpecies = [...new Set(props.spawns.filter((spawn) => spawn.map === props.map.id).map((spawn) => `monster-${spawn.kind}`))]
  if (!expectedSpecies.length && props.document.ecology_zones === undefined) return []
  const zones = ecologyZonesSchema.safeParse(props.document.ecology_zones)
  if (!zones.success) return ["Invalid map ecology zones"]
  const errors: string[] = [],
    species = new Set(zones.data.map((zone) => zone.species))
  if (species.size !== zones.data.length || species.size !== expectedSpecies.length || expectedSpecies.some((id) => !species.has(id))) errors.push("Map ecology zones disagree with registered species")
  for (const zone of zones.data) {
    const kind = props.kinds.get(zone.species)
    if (!kind) {
      errors.push(`${zone.species}: unknown habitat species`)
      continue
    }
    if (props.document.design_gate === "通過") errors.push(`${zone.species}: habitat placement is still unverified`)
    if (zone.placement) {
      const territories = props.spawns.filter((spawn) => spawn.map === props.map.id && `monster-${spawn.kind}` === zone.species).map((spawn) => spawn.area)
      errors.push(
        ...[...getEcologyPlacementErrors({ placement: zone.placement, map: props.map, kind }), ...getEcologyTerritoryErrors({ placement: zone.placement, territories })].map(
          (message) => `${zone.species}: ${message}`,
        ),
      )
    }
  }
  return errors
}
