import type { EntryStepSection, EntryStepRectangle } from "#/scripts/lib/entry-step-geometry-types"
import { getEntryStepPoint } from "#/scripts/lib/get-entry-step-point"
export function getEntryStepRectangle(section: EntryStepSection, start: number, end: number): EntryStepRectangle {
  const first = getEntryStepPoint(section, start)
  const last = getEntryStepPoint(section, end)
  const dx = (Math.abs(section.pose.outward[1]) * section.width) / section.metres / 2
  const dz = (Math.abs(section.pose.outward[0]) * section.width) / section.metres / 2
  return [Math.min(first[0], last[0]) - dx, Math.min(first[1], last[1]) - dz, Math.max(first[0], last[0]) + dx, Math.max(first[1], last[1]) + dz]
}
