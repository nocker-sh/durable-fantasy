import { useState } from "react"
import { Badge } from "#/components/ui/badge"
import { Input } from "#/components/ui/input"
import { hrefOf } from "#/dev/sheets/href-of"
import type { Sheet } from "#/dev/sheets/schema"
import { Grid } from "#/dev/grid"

export function SheetList(inputProps: { sheet: Sheet }) {
  const sheet = inputProps.sheet

  const qState = useState(""),
    q = qState[0],
    setQ = qState[1]
  const all = sheet.rows()
  const showId = all.some((r) => sheet.key(r) !== sheet.name(r))
  const rows = all.filter((r) => !q || sheet.key(r).includes(q) || sheet.name(r).includes(q) || sheet.kind(r).includes(q))
  const head = [...(sheet.icon ? [""] : []), ...(showId ? ["ID"] : []), "名前", "種類", ...sheet.cols.map((c) => c.label)]
  const widths = [...(sheet.icon ? ["w-10"] : []), ...(showId ? ["w-[16%]"] : []), "w-[20%]", "w-[12%]"]
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {sheet.top?.()}
      <div className="flex items-center gap-2">
        <Input placeholder="絞り込み" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 max-w-xs" />
        <Badge variant="secondary">{rows.length}</Badge>
      </div>
      <Grid
        head={head}
        widths={widths}
        rows={rows.map((r) => {
          const href = hrefOf(sheet.id, sheet.key(r))
          return [
            ...(sheet.icon ? [sheet.icon(r)] : []),
            ...(showId
              ? [
                  <a key="id" href={href} className="font-mono underline-offset-4 hover:underline">
                    {sheet.key(r)}
                  </a>,
                ]
              : []),
            <a key="name" href={href} className="underline-offset-4 hover:underline">
              {sheet.name(r)}
            </a>,
            sheet.kind(r),
            ...sheet.cols.map((c) => c.get(r)),
          ]
        })}
      />
    </div>
  )
}
