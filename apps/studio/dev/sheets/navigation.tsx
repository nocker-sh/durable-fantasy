import type { Ref } from "#/dev/sheets/schema"
import { sheetOf } from "#/dev/sheets/sheet-of"
import { rowOf } from "#/dev/sheets/row-of"

import { RowLink } from "#/dev/sheets/row-link"

/** A link to a row, by its name; plain text where the row is not in any sheet. */
export function Link(inputProps: { r: Ref }) {
  const r = inputProps.r

  const s = sheetOf(r.sheet)
  const row = rowOf(r.sheet, r.id)
  if (!s || row === undefined) return <>{r.id}</>
  return (
    <RowLink sheet={r.sheet} id={r.id}>
      {s.name(row)}
    </RowLink>
  )
}
