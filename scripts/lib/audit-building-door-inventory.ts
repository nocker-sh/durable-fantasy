import { buildingDoorInventorySchema } from "#/scripts/lib/building-door-inventory-schema"
import { getBuildingDoorPortals } from "#/scripts/lib/get-building-door-portals"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** An inventory covers every physical portal once; a shared connection never licenses two independently opening doors. */
export function auditBuildingDoorInventory(building: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): readonly string[] {
  if (building.door_leaf_inventory === undefined && building.design_gate !== "通過") return []
  const inventory = buildingDoorInventorySchema.safeParse(building.door_leaf_inventory),
    portals = getBuildingDoorPortals({ building, documents })
  if (!inventory.success) return ["Invalid building door inventory"]
  if (portals instanceof Error) return [portals.message]
  const errors: string[] = [],
    owners = new Set<string>()
  for (const entry of inventory.data) {
    const portal = portals.find((portal) => portal.room === entry.room && portal.door[0] === entry.door[0] && portal.door[1] === entry.door[1])
    if (!portal || portal.leafCount !== 1 || owners.has(portal.key)) {
      errors.push(`Door inventory ${entry.room}/${entry.door.join(",")}: no unique matching owner`)
      continue
    }
    owners.add(portal.key)
  }
  for (const key of new Set(portals.map((portal) => portal.key))) {
    if (!owners.has(key) || portals.filter((portal) => portal.key === key).reduce((count, portal) => count + portal.leafCount, 0) !== 1)
      errors.push(`Door portal ${key}: missing or duplicate physical ownership`)
  }

  return [...new Set(errors)]
}
