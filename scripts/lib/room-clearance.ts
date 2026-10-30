import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { SettingDocument } from "#/scripts/lib/setting-document"
/** Move a conservative, axis-aligned body footprint; point reachability cannot prove clearance. */
export function auditRoomClearance(document: SettingDocument): string[] {
  if (!document.grid) return []
  const rowsSource = document.grid,
    rows = rowsSource.rows,
    cell_m = rowsSource.cell_m,
    span = Math.ceil(MIN_PASSAGE_WIDTH_M / cell_m)
  const anchors = new Map<string, [number, number]>(),
    entries: number[][] = [],
    errors: string[] = []
  for (let y = 0; y < rows.length; y++)
    for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] === "D") entries.push([x, y])
      let clear = true
      for (let dy = 0; dy < span && clear; dy++)
        for (let dx = 0; dx < span; dx++)
          if (![".", "D"].includes(rows[y + dy]?.[x + dx])) {
            clear = false
            break
          }
      if (clear) anchors.set(`${x},${y}`, [x, y])
    }
  for (const connection of (document.connections ?? []) as { kind?: string; access?: number[] }[]) if (connection.kind === "stair" && connection.access) entries.push(connection.access)
  if (!entries.length) return ["Clearance has no doorway or stair entry"]
  const covers = (entry: number[], entry2: number[]) => {
    const ax = entry[0]
    const ay = entry[1]
    const x = entry2[0]
    const y = entry2[1]
    return x >= ax && y >= ay && x < ax + span && y < ay + span
  }
  const queue = [...anchors.values()].filter((anchor) => covers(anchor, entries[0])),
    reached = new Set(
      queue.map((entry3) => {
        const x = entry3[0]
        const y = entry3[1]
        return `${x},${y}`
      }),
    )
  for (let i = 0; i < queue.length; i++) {
    const xState = queue[i],
      x = xState[0],
      y = xState[1]
    for (const entry4 of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      const nx = entry4[0]
      const ny = entry4[1]

      const key = `${nx},${ny}`,
        next = anchors.get(key)
      if (next && !reached.has(key)) {
        reached.add(key)
        queue.push(next)
      }
    }
  }
  const accessible = (point: number[]) => queue.some((anchor) => covers(anchor, point))
  for (const entry5 of entries) {
    const x = entry5[0]
    const y = entry5[1]
    if (!accessible([x, y])) errors.push(`Insufficient clearance to entry at ${x},${y}`)
  }
  for (const furniture of document.furniture ?? []) for (const point of furniture.access) if (!accessible(point)) errors.push(`${furniture.symbol}: insufficient clearance to use position`)
  return [...new Set(errors)]
}
