import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { MIN_PASSAGE_WIDTH_M, MIN_OPERATING_SIDE_M } from "#/scripts/lib/spatial-rules"
type Props = z.infer<typeof stockLockSchema>

/** Check only the declared local floor, two openings and waiting reservation; no door sweep or animal body fit is inferred. */
export function getStockLockLayoutError(plan: Props): Error | null {
  const rows = plan.layout.rows,
    width = rows[0].length,
    doors = new Set<string>(),
    zone = plan.zones[0].rect
  if (
    width < 3 ||
    rows.length < 3 ||
    ![width * plan.layout.cell_m, rows.length * plan.layout.cell_m].every(Number.isFinite) ||
    rows.some((row) => row.length !== width) ||
    new Set(plan.gates.map((gate) => gate.id)).size !== 2
  )
    return new Error("Invalid stock lock grid or gate identities")
  for (const gate of plan.gates) {
    if (
      (gate.id === "outer" && (gate.side !== "west" || gate.door[0] !== 0 || gate.opens_towards !== "vestibule")) ||
      (gate.id === "inner" && (gate.side !== "east" || gate.door[0] !== width - 1 || gate.opens_towards !== "pasture"))
    )
      return new Error("Stock lock gate has an invalid side or opening direction")
    if (gate.width_cells * plan.layout.cell_m < MIN_PASSAGE_WIDTH_M || gate.door[1] < 1 || gate.door[1] + gate.width_cells >= rows.length)
      return new Error("Stock lock opening has no bounded design width")
    for (const offset of Array.from({ length: gate.width_cells }).keys()) doors.add(`${gate.door[0]},${gate.door[1] + offset}`)
  }
  if (zone[0] < 1 || zone[1] < 1 || zone[0] + zone[2] >= width || zone[1] + zone[3] >= rows.length || Math.min(zone[2], zone[3]) * plan.layout.cell_m < MIN_OPERATING_SIDE_M)
    return new Error("Stock lock waiting floor leaves the enclosure or lacks design width")
  for (const entry of rows.entries())
    for (const x of Array.from({ length: width }).keys()) {
      const y = entry[0],
        symbol = entry[1][x],
        boundary = x === 0 || y === 0 || x === width - 1 || y === rows.length - 1,
        isDoor = doors.has(`${x},${y}`),
        isZone = x >= zone[0] && x < zone[0] + zone[2] && y >= zone[1] && y < zone[1] + zone[3]
      if ((isDoor && symbol !== "D") || (!isDoor && boundary && symbol !== "#") || (!boundary && ![".", "S"].includes(symbol)) || (symbol === "S") !== isZone)
        return new Error("Stock lock grid disagrees with its openings or waiting floor")
    }

  return null
}
