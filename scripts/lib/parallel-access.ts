import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditRoomClearance } from "#/scripts/lib/room-clearance"
/** Hold other declared operating areas occupied while one user enters or leaves their own. */
export function auditParallelAccess(document: SettingDocument): string[] {
  if (!document.grid) return []
  const errors: string[] = []
  for (const mode of document.parallel_use ?? []) {
    const operations = mode.operations.map((operation) => {
      const furniture = document.furniture?.find((f) => f.symbol === operation.furniture)
      return { ...operation, furniture, area: furniture?.use_space?.[operation.space_index]?.rect }
    })
    // Missing, overlapping or duplicate assignments are reported by auditFurnitureUse.
    if (operations.some((o) => !o.area || !document.occupants || !(document.occupants as string[]).includes(o.resident)) || new Set(operations.map((o) => o.resident)).size !== operations.length)
      continue
    if (
      operations.some((a, i) =>
        operations.slice(i + 1).some((b) => {
          const xState = a.area!,
            x = xState[0],
            y = xState[1],
            w = xState[2],
            h = xState[3],
            bxState = b.area!,
            bx = bxState[0],
            by = bxState[1],
            bw = bxState[2],
            bh = bxState[3]
          return x < bx + bw && bx < x + w && y < by + bh && by < y + h
        }),
      )
    )
      continue
    for (const selected of operations) {
      const rows = document.grid.rows.map((row) => [...row])
      for (const other of operations)
        if (other !== selected) {
          const xState2 = other.area!,
            x = xState2[0],
            y = xState2[1],
            w = xState2[2],
            h = xState2[3]
          for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (rows[j]?.[i] === ".") rows[j][i] = "#"
        }
      const xState3 = selected.area!,
        x = xState3[0],
        y = xState3[1],
        w = xState3[2],
        h = xState3[3],
        furniture = selected.furniture!
      const access = furniture.access.filter((entry) => {
        const ax = entry[0]
        const ay = entry[1]
        return ax >= x && ay >= y && ax < x + w && ay < y + h
      })
      if (!access.length) continue
      const occupied: SettingDocument = { ...document, grid: { ...document.grid, rows: rows.map((row) => row.join("")) }, furniture: [{ ...furniture, access }] }
      if (auditRoomClearance(occupied).length) errors.push(`${mode.activity}: other users block access for ${selected.resident}`)
    }
  }
  return errors
}
