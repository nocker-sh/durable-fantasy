import { z } from "zod"
import { doorLeafSection } from "#/world/town/door-leaf-section"
import { entryOpeningHeight } from "#/scripts/lib/entry-opening-height"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
const leavesSchema = z.array(z.object({ door: z.tuple([z.number(), z.number()]), vertical_clearance_m: z.object({ bottom: z.number(), top: z.number() }).optional() }))
export function getEntryStepDoorErrors(building: SettingDocument, room: SettingDocument | undefined, steps: EntrySteps): string[] {
  const leaves = leavesSchema.safeParse(room?.door_leaves ?? [])
  if (!leaves.success) return ["Invalid exterior stair door leaf"]
  const leaf = leaves.data.find((candidate) => candidate.door[0] === steps.door[0] && candidate.door[1] === steps.door[1])
  if (!leaf?.vertical_clearance_m) return []
  try {
    doorLeafSection(entryOpeningHeight(building), leaf.vertical_clearance_m)
    return []
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)]
  }
}
