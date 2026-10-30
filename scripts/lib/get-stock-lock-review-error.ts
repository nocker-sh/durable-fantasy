import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockLayoutError } from "#/scripts/lib/get-stock-lock-layout-error"
import { getStockLockPanelError } from "#/scripts/lib/get-stock-lock-panel-error"
import { getStockLockMakersError } from "#/scripts/lib/get-stock-lock-makers-error"
import { getStockLockWalkingError } from "#/scripts/lib/get-stock-lock-walking-error"
import { getStockLockOperationsError } from "#/scripts/lib/get-stock-lock-operations-error"
import { getStockLockCycle } from "#/world/town/get-stock-lock-cycle"
import { townAnimalSpawns } from "#/world/town/animals"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Bind the proposed cycle to the maintained facility and every actual sheep, rather than omitting animals to clear the lock. */
export function getStockLockReviewError(document: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): Error | null {
  if (document.stock_lock === undefined) return null
  const parsed = stockLockSchema.safeParse(document.stock_lock),
    site = document.site
  if (!parsed.success || document.kind !== "facilities" || document.design_gate === "通過" || !site || typeof site !== "object" || !("map" in site) || typeof site.map !== "string")
    return new Error("Invalid proposed stock lock review")
  const plan = parsed.data,
    operator = documents.get(plan.operator),
    caretakers = document.caretakers,
    dependencies = document.design_dependencies
  if (
    operator?.kind !== "residents" ||
    operator.town !== document.town ||
    !Array.isArray(caretakers) ||
    !caretakers.includes(plan.operator) ||
    !Array.isArray(dependencies) ||
    !dependencies.includes(plan.operator)
  )
    return new Error("Stock lock has no local caretaker dependency")
  const layoutError = getStockLockLayoutError(plan)
  if (layoutError) return layoutError
  const makerError = getStockLockMakersError(document, plan, documents)
  if (makerError) return makerError
  const panelError = getStockLockPanelError(plan)
  if (panelError) return panelError
  const walkingError = getStockLockWalkingError(plan)
  if (walkingError) return walkingError
  const sheep = townAnimalSpawns(site.map.replace(/^map-/, "")).filter((animal) => animal.kind === "sheep"),
    cycle = getStockLockCycle(
      sheep.map((animal) => animal.id),
      plan.events,
    )
  if (cycle instanceof Error) return cycle
  const operationsError = getStockLockOperationsError(plan)
  if (operationsError) return operationsError

  return null
}
