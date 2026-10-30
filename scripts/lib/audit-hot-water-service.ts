import { getHotWaterServiceDefinition } from "#/scripts/lib/get-hot-water-service-definition"
import { getHotWaterReachReviewError } from "#/scripts/lib/get-hot-water-reach-review-error"
import { getHotWaterHoldingReviewError } from "#/scripts/lib/get-hot-water-holding-review-error"
import { getHotWaterBatch } from "#/scripts/lib/get-hot-water-batch"
import { getPotStorageError } from "#/scripts/lib/get-pot-storage-error"
import { getHotWaterOperatorErrors } from "#/scripts/lib/get-hot-water-operator-errors"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Batch capacity and placement are not boiling, grasp, drying or daily-operation approval. */
export function auditHotWaterService(room: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  if (room.hot_water_service === undefined) return []
  const definition = getHotWaterServiceDefinition({ room, documents })
  if (definition instanceof Error) return [`hot-water: ${definition.message}`]
  const plan = definition.plan
  const errors = [...getHotWaterOperatorErrors({ room, documents, plan })]
  if (plan.fill_ml > definition.profile.capacity * 1e6) errors.push("hot-water: Pot batch exceeds its usable fill line")
  const storage = getPotStorageError({ room, plan, profile: definition.profile }),
    batch = getHotWaterBatch({ room, plan }),
    cups = getHotWaterReachReviewError({ room, documents, definition }),
    holding = getHotWaterHoldingReviewError({ room, documents, definition })
  if (storage) errors.push(`hot-water: ${storage.message}`)
  if (cups) errors.push(`hot-water: ${cups.message}`)
  if (batch instanceof Error) errors.push(`hot-water: ${batch.message}`)
  if (holding) errors.push(`hot-water: ${holding.message}`)
  if (room.design_gate === "通過") errors.push("hot-water: Heating and daily handling remain unverified")

  return errors
}
