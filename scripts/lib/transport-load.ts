import type { SettingDocument } from "#/scripts/lib/setting-document"
/** Authoring assumptions for a conservative load check; these are not measured material properties. */
export const PLANNED_WASTE_DENSITY_KG_PER_L = { excreta: 1.2, greywater: 1.05, treated_residue: 1.2, treated_water: 1.05 } as const
type CarryPlan = { carrier: string; max_fill_l: number }
type Route = { container_symbol: string | null; carry_plan?: CarryPlan; to: string }
type HandlingPlan = { max_hand_load_kg: number; status: "proposed" | "designed" }
/** One vessel per trip: geometry and volume do not establish a person's carrying ability. */
export function auditTransportLoads(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const doc of documents.values())
    for (const route of (doc.material_routes ?? []) as Route[]) {
      const fail = (message: string) => errors.push(`${doc.id}: ${message}`)
      const plan = route.carry_plan
      if (!plan) {
        if (doc.design_gate === "通過") fail("transport has no carrying plan")
        continue
      }
      const carrier = documents.get(plan.carrier),
        target = documents.get(route.to),
        profile = carrier?.handling_plan as HandlingPlan | undefined
      const owner = documents.get(String(doc.kind === "rooms" ? doc.building : doc.owner_building))
      if (carrier?.kind !== "residents" || !(owner?.residents as string[] | undefined)?.includes(plan.carrier) || !(target?.caretakers as string[] | undefined)?.includes(plan.carrier))
        fail("carrier is not a responsible household caretaker")
      if (doc.private_for && !(doc.private_for as string[]).includes(plan.carrier)) fail("carrier cannot enter the source room")
      if (!profile || !Number.isFinite(profile.max_hand_load_kg) || profile.max_hand_load_kg <= 0) {
        fail("carrier has no usable handling limit")
        continue
      }
      if (doc.design_gate === "通過") {
        if (profile.status !== "designed") fail("carrier handling limit is still proposed")
        if (carrier?.design_gate !== "通過") fail("carrier design has not passed")
      }
      const vessel = doc.furniture?.find((f) => f.symbol === route.container_symbol)?.transport_container
      if (!doc.grid || !vessel) {
        fail("carrying plan has no placed vessel")
        continue
      }
      if (!Number.isFinite(plan.max_fill_l) || plan.max_fill_l <= 0 || plan.max_fill_l > vessel.capacity_l) {
        fail("operating fill exceeds vessel capacity or is invalid")
        continue
      }
      const density = PLANNED_WASTE_DENSITY_KG_PER_L[vessel.stream as keyof typeof PLANNED_WASTE_DENSITY_KG_PER_L]
      if (!density) {
        fail("container has no planning density model")
        continue
      }
      if (!Number.isFinite(vessel.empty_mass_kg) || vessel.empty_mass_kg <= 0) {
        fail("container has no valid empty mass")
        continue
      }
      const mass = vessel.empty_mass_kg + plan.max_fill_l * density
      if (mass > profile.max_hand_load_kg + 1e-9) fail("filled vessel exceeds the carrier's planned hand load")
    }
  return [...new Set(errors)]
}
