import { Table, TableBody, TableCell, TableRow } from "#/components/ui/table.tsx";
import { GRID_SIZE, WORLD, across, squareAt, type Side, type Square } from "#/world/maps/grid.ts";
import { MAPS } from "#/world/maps/index.ts";
import { sheet } from "./schema.ts";
import { MAP_KIND, mapName, ref } from "./shared.tsx";

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
  // by day and by night, from where you come in (scripts/shoot-maps.ts)
  more: (m) =>
    m.kind === "indoor"
      ? []
      : [
          {
            title: "昼と夜",
            head: [],
            wide: true,
            rows: [
              [
                <div key="i" className="grid gap-2 md:grid-cols-2">
                  {["day", "night"].map((w) => (
                    <img key={w} src={`/dev/maps/${m.id}-${w}.jpg`} alt={w} className="w-full rounded-md border" />
                  ))}
                </div>,
              ],
            ],
          },
        ],
});

/** The world grid as one table: a map's square links to it. */
function WorldGrid() {
  return (
    <Table className="table-fixed">
      <TableBody>
        {Array.from({ length: GRID_SIZE.rows }, (_, row) => (
          <TableRow key={row}>
            {Array.from({ length: GRID_SIZE.cols }, (_, col) => {
              const q = squareAt(col, row);
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
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const SIDE_NAME: Record<Side, string> = { n: "北", e: "東", s: "南", w: "西" };

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
});

export { maps, world };
