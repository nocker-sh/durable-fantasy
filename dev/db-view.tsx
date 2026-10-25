// How every sheet is shown: a list (search, then ID, name, kind and the sheet's own columns) and a
// row's page (its columns, what it points at, what points at it, and the sheet's own tables).
import { useState, type ReactNode } from "react"
import { Badge } from "#/components/ui/badge.tsx"
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs.tsx"
import { Input } from "#/components/ui/input.tsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table.tsx"
import { Link, hrefOf, refsTo, rowOf, sheetOf, type Ref, type Sheet } from "./db.tsx"
import { Turntable } from "./three-view.tsx"

const HEAD = "h-7 overflow-hidden px-2 text-xs text-ellipsis"
const CELL = "px-2 py-1 text-xs"

/** A dense table that never runs wider than its box: long cells are cut short (the whole text on hover). */
export function Grid({ head, rows, widths }: { head: string[]; rows: ReactNode[][]; widths?: (string | undefined)[] }) {
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

export function SheetList({ sheet }: { sheet: Sheet }) {
  const [q, setQ] = useState("")
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

function RefTable({ title, refs }: { title: string; refs: Ref[] }) {
  return (
    <section className="flex min-w-0 flex-col gap-1">
      <h2 className="text-xs font-medium text-muted-foreground">{title}</h2>
      <Grid head={["", "種類", "関係"]} widths={["w-[45%]", "w-[25%]", "w-[30%]"]} rows={refs.map((r) => [<Link key="l" r={r} />, sheetOf(r.sheet)?.label ?? r.sheet, r.as])} />
    </section>
  )
}

export function SheetRow({ sheet, id, children }: { sheet: Sheet; id: string; children?: ReactNode }) {
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

function Preview({ build }: { build: NonNullable<ReturnType<NonNullable<Sheet["build"]>>> }) {
  const [night, setNight] = useState(false)
  return (
    <section className="flex min-w-0 flex-col gap-1">
      <Tabs value={night ? "night" : "day"} onValueChange={(v) => setNight(v === "night")}>
        <TabsList>
          <TabsTrigger value="day">昼</TabsTrigger>
          <TabsTrigger value="night">夜</TabsTrigger>
        </TabsList>
      </Tabs>
      <Turntable build={build} night={night} />
    </section>
  )
}
