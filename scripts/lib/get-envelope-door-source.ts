import { doorLeafSection } from "#/world/town/door-leaf-section"
import { doorMovingThickness } from "#/world/town/door-moving-thickness"
import { doorHandleAlong } from "#/world/town/door-handle-along"
import { roomDoorSwing } from "#/scripts/lib/room-door-swing"
import type { getEnvelopeEntry } from "#/scripts/lib/get-envelope-entry"

/** Resolve measured leaf geometry before projecting it into the outdoor frame. */
export function getEnvelopeDoorSource(entry: ReturnType<typeof getEnvelopeEntry>, entryHeight: number) {
  const leaf = entry.leaf
  if (leaf.paired) throw new Error("Paired exterior door rendering is not supported")
  if (!leaf.vertical_clearance_m) throw new Error("Exterior door vertical clearances are missing")
  if (!leaf.fittings) throw new Error("Exterior door fitting projections are missing")
  doorMovingThickness(leaf.thickness_m, leaf.fittings)
  const section = doorLeafSection(entryHeight, leaf.vertical_clearance_m)
  const swing = roomDoorSwing(entry.room, leaf)
  if (!swing) throw new Error("Exterior door has no valid interior swing")
  if (leaf.fittings.handle_along_m === undefined) throw new Error("Exterior door grip position is missing")
  const handleAlong = doorHandleAlong(swing.radius, leaf.fittings.handle_along_m)
  return { leaf, fittings: leaf.fittings, section, swing, handleAlong, origin: entry.origin }
}
