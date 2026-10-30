import { storageLidPartsAtOffset } from "#/world/town/storage-lid-parts-at-offset"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
import type { StorageLidPlan } from "#/world/town/storage-lid"

/** The same physical pieces serve both the movement checks and rendering of each state. */
export function storageLidState(plan: StorageLidPlan, index: number): StorageBoxPart[] {
  const offset = plan.offsets[index]
  if (!offset) throw new Error("Invalid storage lid state")
  return storageLidPartsAtOffset({ plan, offset })
}
