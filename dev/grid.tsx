import type { ReactNode } from "react"
import { Table } from "#/components/ui/table"
import { TableBody } from "#/components/ui/table-body"
import { TableCell } from "#/components/ui/table-cell"
import { TableHead } from "#/components/ui/table-head"
import { TableHeader } from "#/components/ui/table-header"
import { TableRow } from "#/components/ui/table-row"
import { HEAD, CELL } from "#/dev/db-view"

/** A dense table that never runs wider than its box: long cells are cut short (the whole text on hover). */
export function Grid(inputProps: { head: string[]; rows: ReactNode[][]; widths?: (string | undefined)[] }) {
  const head = inputProps.head
  const rows = inputProps.rows
  const widths = inputProps.widths

  return (
    <Table className="table-fixed">
      {head.length > 0 && (
        <TableHeader>
          <TableRow>
            {head.map((h, i) => (
              <TableHead key={i} className={`${HEAD} ${widths?.[i] ?? ""}`}>
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            {r.map((c, j) => (
              <TableCell key={j} className={`${CELL} ${widths?.[j] ?? ""}`}>
                {c}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
