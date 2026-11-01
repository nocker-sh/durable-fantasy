import { Table } from "#/components/ui/table"
import { TableBody } from "#/components/ui/table-body"
import { TableCell } from "#/components/ui/table-cell"
import { TableRow } from "#/components/ui/table-row"
import { GRID_SIZE, WORLD } from "#/world/maps/grid"
import { across } from "#/world/maps/across"
import { squareAt } from "#/world/maps/square-at"
import { type Side, type Square } from "#/world/maps/grid-types"
import { MAPS } from "#/world/maps/index"
import { sheet } from "#/dev/sheets/schema"
import { MAP_KIND } from "#/dev/sheets/shared"
import { mapName } from "#/dev/sheets/map-name"
import { ref } from "#/dev/sheets/ref"

/** The pictures scripts/shoot-maps.ts takes of each map, in public/dev/maps/<id>-<view>.jpg. */
const SHOTS = {
  outdoor: [
    { view: "day", label: "昼 12:00" },
    { view: "night", label: "夜 21:00" },
    { view: "back", label: "反対側から" },
  ],
  indoor: [
    { view: "whole", label: "部屋全体" },
    { view: "close", label: "寄り" },
  ],
}

const maps = sheet({
  id: "maps",
  label: "マップ",
  rows: () => Object.values(MAPS),
  key: (m) => m.id,
  name: (m) => m.name,
  kind: (m) => MAP_KIND[m.kind],
  cols: [
    { label: "大きさ", get: (m) => m.size, w: "w-14" },
    { label: "住民", get: (m) => m.npcs.length, w: "w-12" },
    { label: "出口", get: (m) => m.warps.length, w: "w-12" },
  ],
  refs: (m) => [...new Set(m.warps.map((w) => w.to.map))].map((id) => ({ sheet: "maps", id, as: "出口" })),
  top: () => <WorldGrid />,
  // the pictures of each map (scripts/shoot-maps.ts)
  more: (m) => [
    {
      title: "3D",
      head: [],
      wide: true,
      rows: [
        [
          <a key="v" href={`/dev/view?map=${m.id}`} className="underline">
            /dev/view?map={m.id} で、プレイヤーや画面の枠なしに見る
          </a>,
        ],
      ],
    },
    {
      title: "見た目",
      head: [],
      wide: true,
      rows: [
        [
          <div key="i" className={`grid gap-2 ${m.kind === "indoor" ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {SHOTS[m.kind === "indoor" ? "indoor" : "outdoor"].map((s) => (
              <figure key={s.view} className="grid gap-1">
                <img src={`/dev/maps/${m.id}-${s.view}.jpg`} alt={s.label} className="w-full rounded-md border" />
                <figcaption className="text-muted-foreground text-xs">{s.label}</figcaption>
              </figure>
            ))}
          </div>,
        ],
      ],
    },
  ],
})

/** The world grid as one table: a map's square links to it. */
function WorldGrid() {
  return (
    <Table className="table-fixed">
      <TableBody>
        {Array.from({ length: GRID_SIZE.rows }, (_, row) => (
          <TableRow key={row}>
            {Array.from({ length: GRID_SIZE.cols }, (_, col) => {
              const q = squareAt(col, row)
              return (
                <TableCell key={col} className="h-10 border px-2 py-1 text-xs">
                  {q?.map ? (
                    <a href={`/dev/maps/${q.map}`} className="underline-offset-4 hover:underline">
                      {mapName(q.map)}
                    </a>
                  ) : q?.city ? (
                    <span className="text-muted-foreground">{q.city}</span>
                  ) : null}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const SIDE_NAME: Record<Side, string> = { n: "北", e: "東", s: "南", w: "西" }

const world = sheet<Square>({
  id: "world",
  label: "世界の升目",
  rows: () => WORLD,
  key: (q) => q.at.join(","),
  name: (q) => (q.map ? mapName(q.map) : (q.city ?? "")),
  kind: (q) => (q.city ? "まだ入れない町" : MAP_KIND[MAPS[q.map!]?.kind ?? "field"]),
  cols: [
    { label: "列", get: (q) => q.at[0], w: "w-10" },
    { label: "行", get: (q) => q.at[1], w: "w-10" },
    { label: "通れない辺", get: (q) => (q.walls ?? []).map((d) => SIDE_NAME[d]).join("・") },
    {
      label: "隣",
      get: (q) =>
        (["n", "e", "s", "w"] as Side[])
          .map((d) => across(q, d))
          .filter((o) => o?.map)
          .map((o) => mapName(o!.map!))
          .join("、"),
    },
  ],
  refs: (q) => [...ref("maps", q.map, "マップ"), ...(["n", "e", "s", "w"] as Side[]).flatMap((d) => ref("world", across(q, d)?.at.join(","), `${SIDE_NAME[d]}隣`))],
})

export { maps, world }
