import type { ReactNode } from "react"
import { Badge } from "#/components/ui/badge"
import { refsTo } from "#/dev/sheets/refs-to"
import { rowOf } from "#/dev/sheets/row-of"
import type { Sheet } from "#/dev/sheets/schema"
import { Grid } from "#/dev/grid"
import { RefTable } from "#/dev/ref-table"
import { Preview } from "#/dev/preview"

export function SheetRow(inputProps: { sheet: Sheet; id: string; children?: ReactNode }) {
  const sheet = inputProps.sheet
  const id = inputProps.id
  const children = inputProps.children

  const row = rowOf(sheet.id, id)
  if (row === undefined) return <p className="text-sm">{id}</p>
  const out = sheet.refs?.(row) ?? []
  const into = refsTo(sheet.id, id)
  const build = sheet.build?.(row) ?? null
  const parts = sheet.more?.(row) ?? []
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center gap-2">
        {sheet.icon?.(row)}
        <h1 className="text-base font-semibold">{sheet.name(row)}</h1>
        <Badge variant="secondary">{sheet.kind(row)}</Badge>
        {id !== sheet.name(row) && <span className="font-mono text-xs text-muted-foreground">{id}</span>}
      </div>
      {children}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="flex min-w-0 flex-col gap-1">
          <h2 className="text-xs font-medium text-muted-foreground">項目</h2>
          <Grid head={[]} widths={["w-[35%]", ""]} rows={[["種類", sheet.kind(row)], ...sheet.cols.map((c) => [c.label, c.get(row)])]} />
        </section>
        {out.length > 0 && <RefTable title="参照先" refs={out} />}
        {into.length > 0 && <RefTable title="参照元" refs={into} />}
        {build && <Preview build={build} />}
        {parts
          .filter((p) => p.rows.length)
          .map((p) => (
            <section key={p.title} className={`flex min-w-0 flex-col gap-1 ${p.head.length > 3 || p.wide ? "lg:col-span-3" : ""}`}>
              <h2 className="text-xs font-medium text-muted-foreground">{p.title}</h2>
              <Grid head={p.head} rows={p.rows} />
            </section>
          ))}
      </div>
    </div>
  )
}
