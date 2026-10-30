import type { ReactNode } from "react"
import { hrefOf } from "#/dev/sheets/href-of"

/** A named row link; resolving the row is the caller's responsibility. */
export function RowLink(inputProps: { sheet: string; id: string; children: ReactNode }) {
  const sheet = inputProps.sheet
  const id = inputProps.id
  const children = inputProps.children

  return (
    <a href={hrefOf(sheet, id)} className="underline-offset-4 hover:underline">
      {children}
    </a>
  )
}
