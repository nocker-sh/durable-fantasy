import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { z } from "zod"
import type { windmillYardSchema } from "#/scripts/lib/windmill-yard-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ grid: NonNullable<SettingDocument["grid"]>; plan: z.infer<typeof windmillYardSchema> }>

/** Reserve a continuous enclosure with one contiguous south opening; this does not certify its moving gate or rotor. */
export function getWindmillYardBoundaryErrors(props: Props): readonly string[] {
  const rect = props.plan.enclosure_rect,
    rows = props.grid.rows,
    cells = props.plan.gate.cells
  if (rect[0] + rect[2] > rows[0].length || rect[1] + rect[3] > rows.length) return ["Machine enclosure leaves the yard grid"]
  const gates = new Set(cells.map((cell) => `${cell[0]},${cell[1]}`)),
    columns = cells.map((cell) => cell[0])
  const south = rect[1] + rect[3] - 1
  if (
    gates.size !== cells.length ||
    cells.length * props.grid.cell_m < MIN_PASSAGE_WIDTH_M ||
    Math.max(...columns) - Math.min(...columns) + 1 !== cells.length ||
    cells.some((cell) => cell[1] !== south || cell[0] <= rect[0] || cell[0] >= rect[0] + rect[2] - 1)
  )
    return ["Machine enclosure has no contiguous usable south gate"]
  const errors: string[] = []
  for (const y of Array.from({ length: rect[3] }).keys())
    for (const x of Array.from({ length: rect[2] }).keys()) {
      if (x !== 0 && y !== 0 && x !== rect[2] - 1 && y !== rect[3] - 1) continue
      const column = rect[0] + x,
        row = rect[1] + y,
        expected = gates.has(`${column},${row}`) ? "D" : "#"
      if (rows[row]?.[column] !== expected) errors.push("Machine enclosure boundary disagrees with its gate reservation")
    }
  return [...new Set(errors)]
}
