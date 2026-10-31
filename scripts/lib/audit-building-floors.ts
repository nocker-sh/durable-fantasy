import { auditBuildingFloor } from "#/scripts/lib/audit-building-floor"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Layout } from "#/scripts/lib/building-layout"

type Props = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; layout: Layout; roomIds: readonly string[] }>

/** Cross-floor registration is distinct from each floor's own planar occupancy. */
export function auditBuildingFloors(props: Props) {
  const errors: string[] = [],
    placed = new Set<string>(),
    levels = new Set<number>()

  for (const floor of props.layout.floors) {
    if (!Number.isSafeInteger(floor.floor) || levels.has(floor.floor)) {
      errors.push("Duplicate or invalid floor")
      continue
    }
    levels.add(floor.floor)
    errors.push(...auditBuildingFloor({ ...props, floor, placed }))
  }

  for (const id of props.roomIds) if (!placed.has(id)) errors.push(`${id}: not placed on a floor`)
  for (const id of placed) if (!props.roomIds.includes(id)) errors.push(`${id}: floor room missing from building inventory`)

  return { errors, placed }
}
