import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Leaf, DoorSwing } from "#/scripts/lib/door-swing"
import { roomDoorSwing } from "#/scripts/lib/room-door-swing"

/** Equal inward-opening leaves share one aperture, with hinges on its opposite ends. */
export function roomDoorSwings(document: SettingDocument, leaf: Leaf): DoorSwing[] {
  const hinges = leaf.paired ? (["start", "end"] as const) : [leaf.hinge]
  return hinges.flatMap((hinge) => {
    const swing = roomDoorSwing(document, { ...leaf, hinge })
    return swing ? [swing] : []
  })
}
