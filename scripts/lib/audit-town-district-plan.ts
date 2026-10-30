import { getTownDistrictGridErrors } from "#/scripts/lib/get-town-district-grid-errors"
import { getTownDistrictReservationErrors } from "#/scripts/lib/get-town-district-reservation-errors"
import { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ town: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }>

/** Unimplemented cities need an explicit unplaced study; connectivity never clears their life-design gate. */
export function auditTownDistrictPlan(props: Props): readonly string[] {
  if (props.town.town_district_plan === undefined && !["town-hue", "town-quynhon"].includes(props.town.id)) return []
  const parsed = townDistrictPlanSchema.safeParse(props.town.town_district_plan)
  if (!parsed.success || props.town.kind !== "towns") return [`${props.town.id}: Invalid town district study`]
  const plan = parsed.data,
    roles = new Set(plan.districts.map((district) => district.role)),
    errors = [...getTownDistrictGridErrors(plan)]
  if (new Set(plan.districts.map((district) => district.symbol)).size !== plan.districts.length) errors.push("District symbols are duplicated")
  for (const required of ["work", "food", "housing", "fuel", "water", "care", "waste", "laundry"] satisfies (typeof plan.districts)[number]["role"][])
    if (!roles.has(required)) errors.push(`Missing life district: ${required}`)
  if (props.town.id === "town-quynhon" && (!roles.has("dock") || !roles.has("trade") || !roles.has("lodging"))) errors.push("Port study omits landing, cargo or visitor accommodation")
  if (props.documents.get(plan.entry_map)?.kind !== "maps" || !Array.isArray(props.town.maps) || !props.town.maps.includes(plan.entry_map)) errors.push("District study has no declared gate map")
  if (props.town.design_gate === "通過") errors.push("Unplaced district study cannot clear the town design gate")
  errors.push(...getTownDistrictReservationErrors({ ...props, plan }))

  return errors.map((error) => `${props.town.id}: ${error}`)
}
