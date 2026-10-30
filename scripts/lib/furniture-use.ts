import { MIN_OPERATING_SIDE_M } from "./spatial-rules"
import type { SettingDocument } from "#/scripts/lib/setting-document"
/** The furniture footprint alone cannot prove that a person can use it. */
export function auditFurnitureUse(document: SettingDocument): string[] {
  if (!document.grid) return []
  const errors: string[] = [],
    rows = document.grid.rows,
    scale = document.grid.cell_m
  for (const furniture of document.furniture ?? []) {
    const spaces = furniture.use_space
    if (!spaces?.length) {
      if (document.design_gate === "通過") errors.push(`${furniture.symbol}: no operating space is designed`)
      continue
    }
    for (const space of spaces) {
      const xState = space.rect,
        x = xState[0],
        y = xState[1],
        w = xState[2],
        h = xState[3]
      if (
        !furniture.access.some((entry) => {
          const ax = entry[0]
          const ay = entry[1]
          return ax >= x && ay >= y && ax < x + w && ay < y + h
        })
      )
        errors.push(`${furniture.symbol}: operating space has no use position`)
      if (w * scale < MIN_OPERATING_SIDE_M || h * scale < MIN_OPERATING_SIDE_M) errors.push(`${furniture.symbol}: operating space is too narrow`)
      for (let row = y; row < y + h; row++) for (let column = x; column < x + w; column++) if (rows[row]?.[column] !== ".") errors.push(`${furniture.symbol}: operating space is not clear floor`)
    }
    for (const entry2 of furniture.access) {
      const x = entry2[0]
      const y = entry2[1]
      if (
        !spaces.some((inputProps) => {
          const nestedValue = inputProps.rect
          const sx = nestedValue[0]
          const sy = nestedValue[1]
          const w = nestedValue[2]
          const h = nestedValue[3]
          return x >= sx && y >= sy && x < sx + w && y < sy + h
        })
      )
        errors.push(`${furniture.symbol}: use position lies outside operating space`)
    }
  }
  for (const mode of document.parallel_use ?? []) {
    const residents = new Set<string>(),
      areas: number[][] = []
    for (const operation of mode.operations) {
      if (!Array.isArray(document.occupants) || !document.occupants.includes(operation.resident)) errors.push(`${mode.activity}: user is not a room occupant`)
      if (residents.has(operation.resident)) errors.push(`${mode.activity}: one person cannot perform simultaneous operations`)
      residents.add(operation.resident)
      const area = document.furniture?.find((inputProps2) => {
        const symbol = inputProps2.symbol
        return symbol === operation.furniture
      })?.use_space?.[operation.space_index]?.rect
      if (!area) {
        errors.push(`${mode.activity}: missing operating space`)
        continue
      }
      const xState2 = area,
        x = xState2[0],
        y = xState2[1],
        w = xState2[2],
        h = xState2[3]
      if (
        areas.some((entry3) => {
          const ax = entry3[0]
          const ay = entry3[1]
          const aw = entry3[2]
          const ah = entry3[3]
          return x < ax + aw && ax < x + w && y < ay + ah && ay < y + h
        })
      )
        errors.push(`${mode.activity}: simultaneous operating spaces overlap`)
      areas.push(area)
    }
  }
  return [...new Set(errors)]
}
