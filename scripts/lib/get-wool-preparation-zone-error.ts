import { getConnectedGridCells } from "#/lib/engine/get-connected-grid-cells"
import { WOOL_PREPARATION_STATIONS } from "#/scripts/lib/wool-preparation-stations"
import type { z } from "zod"
import type { woolPreparationSchema } from "#/scripts/lib/wool-preparation-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ facility: SettingDocument; plan: z.infer<typeof woolPreparationSchema>; zone: "dirty" | "clean" }>

/** Work faces within one area must connect without a detour through the opposite area; this does not certify handling hygiene or a body-sized route. */
export function getWoolPreparationZoneError(props: Props): Error | null {
  const grid = props.facility.grid,
    area = props.plan.zones[props.zone],
    symbols = WOOL_PREPARATION_STATIONS.filter((station) => station.zone === props.zone).map((station) => props.plan.stations[station.station])
  const pieces = props.facility.furniture?.filter((piece) => symbols.includes(piece.symbol)) ?? []
  if (!grid || pieces.length !== symbols.length || area[0] + area[2] > grid.rows[0].length || area[1] + area[3] > grid.rows.length) return new Error("Wool work area is missing or outside its grid")
  for (const piece of pieces) {
    const rectangles = [piece.rect, ...(piece.use_space ?? []).map((space) => space.rect)]
    if (!piece.access.length || rectangles.some((rect) => rect[0] < area[0] || rect[1] < area[1] || rect[0] + rect[2] > area[0] + area[2] || rect[1] + rect[3] > area[1] + area[3]))
      return new Error("Wool station or work face leaves its assigned area")
  }
  const start = pieces[0].access[0],
    cells = getConnectedGridCells({
      width: grid.rows[0].length,
      height: grid.rows.length,
      start: [start[0], start[1]],
      isFree: (x, y) => x >= area[0] && y >= area[1] && x < area[0] + area[2] && y < area[1] + area[3] && grid.rows[y][x] === ".",
    })
  if (pieces.some((piece) => piece.access.some((cell) => !cells.has(`${cell[0]},${cell[1]}`)))) return new Error("Wool work faces require leaving their assigned area")

  return null
}
