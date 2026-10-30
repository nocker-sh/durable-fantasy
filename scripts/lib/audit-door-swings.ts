import { auditPairedDoorOperation } from "#/scripts/lib/audit-paired-door-operation"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditOperatorSpaces } from "#/scripts/lib/audit-operator-spaces"
import { auditDoorOperation } from "#/scripts/lib/audit-door-operation"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { Leaf } from "#/scripts/lib/door-swing"
import { swingHitsRect } from "#/scripts/lib/swing-hits-rect"
import { roomDoorSwings } from "#/scripts/lib/room-door-swings"

export function auditDoorSwings(document: SettingDocument): string[] {
  if (!document.grid) return []
  const leaves = (document.door_leaves ?? []) as Leaf[],
    errors: string[] = [],
    seen = new Set<string>(),
    scale = document.grid.cell_m
  for (const leaf of leaves) {
    const key = leaf.door.join(","),
      swings = roomDoorSwings(document, leaf)
    if (seen.has(key)) errors.push(`Door ${key}: duplicate leaf`)
    seen.add(key)
    if (!swings.length) {
      errors.push(`Door ${key}: no matching boundary door`)
      continue
    }
    if (swings[0].radius * swings.length + (leaf.paired ? (leaf.meeting_gap_m ?? 0) : 0) - (swings[0].thickness_m ?? 0) * swings.length + 1e-9 < MIN_PASSAGE_WIDTH_M)
      errors.push(`Door ${key}: frame and open leaf leave insufficient width`)
    if (document.design_gate === "通過" && (leaf.frame_inset_m === undefined || leaf.thickness_m === undefined)) errors.push(`Door ${key}: leaf thickness or frame is not designed`)
    if (document.design_gate === "通過" && (!leaf.fittings || leaf.fittings.handle_along_m === undefined)) errors.push(`Door ${key}: fitting projections are not designed`)
    if (document.design_gate === "通過" && !leaf.vertical_clearance_m) errors.push(`Door ${key}: vertical leaf clearances are not designed`)
    if (!leaf.paired && leaf.meeting_gap_m) errors.push(`Door ${key}: meeting gap needs paired leaves`)
    if (leaf.paired && leaf.operation) errors.push(`Door ${key}: a shared operator arc cannot describe two leaves`)
    if (leaf.paired && !leaf.paired_sequence && document.design_gate === "通過") errors.push(`Door ${key}: paired leaf operating sequence is not designed`)
    if (leaf.paired_sequence) {
      if (!leaf.paired) errors.push(`Door ${key}: paired sequence needs a paired aperture`)
      else {
        errors.push(...auditPairedDoorOperation({ swings: swings, sequence: leaf.paired_sequence, rows: document.grid.rows, scale: scale }).map((error) => `Door ${key}: ${error}`))
        for (const entry of [leaf.paired_sequence.start, leaf.paired_sequence.end].entries()) {
          const index = entry[0]
          const operation = entry[1]
          errors.push(...auditOperatorSpaces({ swing: swings[index], operation: operation, furniture: document.furniture ?? [], scale: scale }).map((error) => `Door ${key}: ${error}`))
        }
      }
    }
    if (!leaf.paired && leaf.operation)
      errors.push(
        ...[
          ...auditDoorOperation({ swing: swings[0], operation: leaf.operation, rows: document.grid.rows, scale: scale }),
          ...auditOperatorSpaces({ swing: swings[0], operation: leaf.operation, furniture: document.furniture ?? [], scale: scale }),
        ].map((error) => `Door ${key}: ${error}`),
      )
    for (const y = { value: 0 }; y.value < document.grid.rows.length; y.value++)
      for (const x = { value: 0 }; x.value < document.grid.rows[y.value].length; x.value++) {
        const symbol = document.grid.rows[y.value][x.value]
        if (![".", "D"].includes(symbol) && swings.some((swing) => swingHitsRect(swing, [x.value * scale, y.value * scale, scale, scale]))) errors.push(`Door ${key}: swing hits ${symbol}`)
      }
    const sequenced = new Set(leaf.waits_for.map((e) => `${e.furniture}/${e.space_index}`))
    if (sequenced.size !== leaf.waits_for.length) errors.push(`Door ${key}: duplicate sequence`)
    for (const sequence of leaf.waits_for) {
      const space = document.furniture?.find((f) => f.symbol === sequence.furniture)?.use_space?.[sequence.space_index]
      if (
        !space ||
        !swings.some((swing) =>
          swingHitsRect(
            swing,
            space.rect.map((n) => n * scale),
          ),
        )
      )
        errors.push(`Door ${key}: sequence has no overlapping operating space`)
    }
    for (const furniture of document.furniture ?? [])
      for (const entry2 of (furniture.use_space ?? []).entries()) {
        const index = entry2[0]
        const space = entry2[1]
        if (
          swings.some((swing) =>
            swingHitsRect(
              swing,
              space.rect.map((n) => n * scale),
            ),
          ) &&
          !sequenced.has(`${furniture.symbol}/${index}`)
        )
          errors.push(`Door ${key}: unsequenced operating space ${furniture.symbol}/${index}`)
      }
  }
  return [...new Set(errors)]
}
