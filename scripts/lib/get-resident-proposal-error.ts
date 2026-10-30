import { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import { getProposedResidentDayError } from "#/scripts/lib/get-proposed-resident-day-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ resident: SettingDocument; documents: ReadonlyMap<string, SettingDocument> }>

/** Require the authored town, home and bedroom; ordinary bed and storage audits still apply, without invented native bindings or a completed gate. */
export function getResidentProposalError(props: Props): Error | null {
  const resident = props.resident,
    proposal = residentProposalSchema.safeParse(resident.resident_proposal),
    town = props.documents.get(String(resident.town)),
    study = townDistrictPlanSchema.safeParse(town?.town_district_plan)
  if (!proposal.success || !study.success || town?.kind !== "towns" || resident.kind !== "residents" || resident.id !== `resident-${resident.title}`)
    return new Error("Invalid proposed resident or unplaced town study")
  if (
    resident.design_gate === "通過" ||
    resident.status !== "設計中" ||
    !resident.issues.length ||
    [resident.routine_source, resident.appearance_source, resident.routine, resident.appearance].some((value) => value !== undefined)
  )
    return new Error("Proposed resident cannot replace native bindings or clear the design gate")
  const home = props.documents.get(String(Array.isArray(resident.buildings) && resident.buildings[0])),
    bedroom = props.documents.get(String(resident.bedroom))
  if (
    home?.kind !== "buildings" ||
    home.town !== town.id ||
    home.household !== resident.household ||
    !Array.isArray(home.residents) ||
    !home.residents.includes(resident.id) ||
    bedroom?.kind !== "rooms" ||
    bedroom.building !== home.id ||
    bedroom.town !== town.id
  )
    return new Error("Proposed resident has no consistent home and bedroom")
  if (home.design_gate === "通過" || bedroom.design_gate === "通過") return new Error("Proposed resident household is not implemented")
  const plan = proposal.data,
    districts = study.data.districts
  const map = props.documents.get(String(home.map))
  if (
    home.proposed_district !== plan.home_district ||
    map?.kind !== "maps" ||
    map.town !== town.id ||
    bedroom.map !== map.id ||
    !Array.isArray(town.maps) ||
    !town.maps.includes(map.id) ||
    !Array.isArray(map.buildings) ||
    !map.buildings.includes(home.id) ||
    !Array.isArray(map.residents) ||
    !map.residents.includes(resident.id)
  )
    return new Error("Proposed resident home has no matching town-map allocation")
  if (
    !districts.some((district) => district.symbol === plan.home_district && district.role === "housing") ||
    !districts.some((district) => district.symbol === plan.work_district && district.role === plan.work_district_role)
  )
    return new Error("Proposed resident has no matching home and work districts")

  return getProposedResidentDayError({ resident, proposal: plan, study: study.data, documents: props.documents })
}
