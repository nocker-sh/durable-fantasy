import { getPlaceReachError } from "#/scripts/lib/get-place-reach-error"
import { getTableServicePlan } from "#/scripts/lib/get-table-service-plan"
import { TABLE_SERVICE_KEYS } from "#/scripts/lib/table-service-keys"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Reject incomplete services before proving every valid service's unchanged native motion range. */
export function auditPlaceSettings(room: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  const plans = TABLE_SERVICE_KEYS.filter((key) => room[key] !== undefined).map((key) => getTableServicePlan({ room, key, documents }))
  if (!plans.length) return []
  const errors = plans.flatMap((plan) => (plan instanceof Error ? [`${room.id}: ${plan.message}`] : []))
  if (room.design_gate === "通過") errors.push(`${room.id}: Tabletop serving operation remains proposed`)
  if (errors.length) return errors
  return plans.flatMap((plan) => {
    if (plan instanceof Error) return []
    const error = getPlaceReachError(room, plan, documents)
    if (error) return [`${room.id}: ${error.message}`]
    return []
  })
}
