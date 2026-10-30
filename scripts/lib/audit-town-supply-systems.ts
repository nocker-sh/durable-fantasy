import { townSupplySystemsSchema } from "#/scripts/lib/town-supply-systems-schema"
import { getTownSupplyReferenceErrors } from "#/scripts/lib/get-town-supply-reference-errors"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ town: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }>

/** A supply inventory checks roles and provenance without approving capacity, transport or daily operation. */
export function auditTownSupplySystems(props: Props): readonly string[] {
  if (props.town.kind !== "towns") return []
  if (props.town.supply_systems === undefined && props.town.design_gate !== "通過") return []
  const parsed = townSupplySystemsSchema.safeParse(props.town.supply_systems)
  if (!parsed.success) return [`${props.town.id}: Invalid town supply systems`]
  const errors: string[] = []
  if (new Set(parsed.data.map((system) => system.id)).size !== parsed.data.length) errors.push("Supply system IDs are duplicated")
  for (const system of parsed.data) {
    errors.push(...getTownSupplyReferenceErrors({ ...props, system }))
    if (props.town.design_gate === "通過" && system.unresolved.length) errors.push(`${system.id}: unresolved supply cannot clear the town design gate`)
  }
  return errors.map((error) => `${props.town.id}: ${error}`)
}
