import { Link } from "#/dev/sheets/navigation"
import { sheetOf } from "#/dev/sheets/sheet-of"
import type { Ref } from "#/dev/sheets/schema"
import { Grid } from "#/dev/grid"

export function RefTable(inputProps: { title: string; refs: Ref[] }) {
  const title = inputProps.title
  const refs = inputProps.refs

  return (
    <section className="flex min-w-0 flex-col gap-1">
      <h2 className="text-xs font-medium text-muted-foreground">{title}</h2>
      <Grid head={["", "種類", "関係"]} widths={["w-[45%]", "w-[25%]", "w-[30%]"]} rows={refs.map((r) => [<Link key="l" r={r} />, sheetOf(r.sheet)?.label ?? r.sheet, r.as])} />
    </section>
  )
}
