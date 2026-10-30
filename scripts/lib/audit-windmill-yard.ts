import { getWindmillYardRotorError } from "#/scripts/lib/get-windmill-yard-rotor-error"
import { windmillYardSchema } from "#/scripts/lib/windmill-yard-schema"
import { getWindmillYardBoundaryErrors } from "#/scripts/lib/get-windmill-yard-boundary-errors"
import { getWindmillYardZoneErrors } from "#/scripts/lib/get-windmill-yard-zone-errors"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { auditFurnitureUse } from "#/scripts/lib/furniture-use"
import { auditRoomClearance } from "#/scripts/lib/room-clearance"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Validate the unplaced workyard's authored separation without approving the mill mechanism or site. */
export function auditWindmillYard(document: SettingDocument): readonly string[] {
  if (document.windmill_yard === undefined && document.id !== "facility-square-windmill") return []
  const parsed = windmillYardSchema.safeParse(document.windmill_yard)
  if (!parsed.success || document.kind !== "facilities" || !document.grid) return ["Invalid windmill yard proposal"]
  const basic = auditRoomGrid(document)
  if (basic.length) return basic
  const errors = [
    ...auditFurnitureUse(document),
    ...auditRoomClearance(document),
    ...getWindmillYardBoundaryErrors({ grid: document.grid, plan: parsed.data }),
    ...getWindmillYardZoneErrors({ document, plan: parsed.data }),
  ]
  const rotor = getWindmillYardRotorError({ document, plan: parsed.data })
  if (rotor) errors.push(rotor.message)
  if (document.design_gate === "通過") errors.push("Unplaced windmill yard cannot clear the facility design gate")
  return errors
}
