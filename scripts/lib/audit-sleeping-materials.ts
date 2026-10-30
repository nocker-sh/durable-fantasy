import { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
import { getRoomBedDefinition } from "#/scripts/lib/get-room-bed-definition"
import { getSleepingTextileOrdersError } from "#/scripts/lib/get-sleeping-textile-orders-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Provenance and made-bed linen belong to the actual assigned owner; they do not approve care or sleeping motions. */
export function auditSleepingMaterials(room: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  if (room.sleeping_materials === undefined) return []
  const parsed = sleepingMaterialsSchema.safeParse(room.sleeping_materials)
  if (!parsed.success) return ["sleeping-materials: Invalid bed and made-linen proposal"]
  const plan = parsed.data,
    definition = getRoomBedDefinition({ room, bedId: plan.bed })
  if (definition instanceof Error) return [`sleeping-materials: ${definition.message}`]
  if (definition.bed.linen === null || definition.bed.linen.some((piece) => piece.id !== `${plan.bed}:${piece.kind}`)) return ["sleeping-materials: Made linen has no unique sleeping-bed identity"]
  const owner = documents.get(definition.place.resident),
    errors: string[] = [],
    dependencies = room.design_dependencies
  if (
    owner?.kind !== "residents" ||
    owner.bedroom !== room.id ||
    owner.bed_id !== definition.place.id ||
    definition.furniture.owner !== owner.title ||
    !Array.isArray(room.occupants) ||
    !room.occupants.includes(owner.title)
  )
    errors.push("sleeping-materials: Measured bed and sleeping owner disagree")
  const suppliers: readonly (readonly [string, string])[] = [
    [plan.frame.maker, "木工師"],
    [plan.frame.timber_supplier, "木こり"],
    [plan.textile.spinner, "機織り"],
    [plan.textile.weaver, "機織り"],
    [plan.textile.tailor, "仕立て屋"],
    [plan.textile.wool_supplier, "羊飼い"],
  ]
  for (const supplier of suppliers) {
    const resident = documents.get(supplier[0])
    if (resident?.kind !== "residents" || resident.work !== supplier[1] || resident.town !== room.town || !Array.isArray(dependencies) || !dependencies.includes(supplier[0]))
      errors.push(`sleeping-materials: Missing matching supplier prerequisite ${supplier[0]}`)
  }
  if (room.design_gate === "通過") errors.push("sleeping-materials: Sleeping and daily linen care remain unverified")
  if (plan.blanket_cutting || plan.pillow_cover_cutting) {
    const cutting = getSleepingTextileOrdersError({ room, documents })
    if (cutting) errors.push(`sleeping-materials: ${cutting.message}`)
  }

  return errors
}
