import { buildingLayoutSchema, buildingRoomIdsSchema } from "#/scripts/lib/building-layout-schema"
import { auditBuildingDoorInventory } from "#/scripts/lib/audit-building-door-inventory"
import { auditBuildingFloors } from "#/scripts/lib/audit-building-floors"
import { auditBuildingAccess } from "#/scripts/lib/building-layout/audit-building-access"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Check the assembled building, without substituting its projection for the room's own design. */
export function auditBuildingLayout(building: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): string[] {
  const doorErrors = auditBuildingDoorInventory(building, documents)
  if (building.layout === undefined || building.layout === null) return [...doorErrors]

  const parsedLayout = buildingLayoutSchema.safeParse(building.layout)
  if (!parsedLayout.success) return [...doorErrors, "Invalid building dimensions"]

  const roomIds = buildingRoomIdsSchema.safeParse(building.rooms)
  if (!roomIds.success) return [...doorErrors, "Invalid building room inventory"]

  const floors = auditBuildingFloors({ building, documents, layout: parsedLayout.data, roomIds: roomIds.data })
  const accessErrors = auditBuildingAccess({ building, documents, placed: floors.placed, layout: parsedLayout.data })

  return [...new Set([...doorErrors, ...floors.errors, ...accessErrors])]
}
