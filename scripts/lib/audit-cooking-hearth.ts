import { cookingTopSchema } from "#/scripts/lib/cooking-top-schema"
import { getCookingHearthDefinition } from "#/scripts/lib/get-cooking-hearth-definition"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** A drawing-ready plate still leaves heating, draft, load and daily maintenance unverified. */
export function auditCookingHearth(room: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  const errors: string[] = []
  for (const furniture of room.furniture ?? []) {
    if (furniture.cooking_top === undefined) continue
    const parsed = cookingTopSchema.safeParse(furniture.cooking_top),
      building = documents.get(String(room.building))
    if (!parsed.success || building?.kind !== "buildings") {
      errors.push(`${furniture.symbol}: Invalid cooking hearth proposal`)
      continue
    }
    const dependencies = room.design_dependencies
    if (documents.get(parsed.data.maker)?.kind !== "residents" || !Array.isArray(dependencies) || !dependencies.includes(parsed.data.maker))
      errors.push(`${furniture.symbol}: Cooking plate has no registered maker prerequisite`)
    const definition = getCookingHearthDefinition({ room, documents, building, furniture })
    if (definition instanceof Error) errors.push(`${furniture.symbol}: ${definition.message}`)
    if (room.design_gate === "通過") errors.push(`${furniture.symbol}: Cooking heat and daily operations remain unverified`)
  }

  return errors
}
