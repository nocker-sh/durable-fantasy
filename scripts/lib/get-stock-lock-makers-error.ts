import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Assign both woodwork and fittings to named local makers without treating a proposed order as existing stock. */
export function getStockLockMakersError(document: SettingDocument, plan: z.infer<typeof stockLockSchema>, documents: ReadonlyMap<string, SettingDocument>): Error | null {
  const dependencies = document.design_dependencies
  if (!Array.isArray(dependencies)) return new Error("Stock gate makers have no design dependencies")
  for (const gate of plan.gates) {
    if (new Set(gate.leaf.makers.map((maker) => maker.role)).size !== 2) return new Error("Stock gate must assign both timber and fittings")
    for (const maker of gate.leaf.makers) {
      const resident = documents.get(maker.resident)
      if (resident?.kind !== "residents" || resident.town !== document.town || !dependencies.includes(maker.resident)) return new Error("Stock gate has no local maker dependency")
    }
  }

  return null
}
