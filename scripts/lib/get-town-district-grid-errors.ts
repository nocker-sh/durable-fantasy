import { getConnectedGridCells } from "#/lib/engine/get-connected-grid-cells"
import type { z } from "zod"
import type { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
type Props = z.infer<typeof townDistrictPlanSchema>

/** Match the authored reservations exactly and connect their access cells without crossing water or district interiors. */
export function getTownDistrictGridErrors(plan: Props): readonly string[] {
  const width = plan.rows[0].length,
    height = plan.rows.length,
    errors: string[] = [],
    occupied = new Map<string, string>()
  if (plan.rows.some((row) => row.length !== width) || plan.rows[plan.entrance[1]]?.[plan.entrance[0]] !== "D" || plan.rows.join("").split("D").length !== 2)
    return ["Invalid district grid or entrance"]
  const reachable = getConnectedGridCells({ width, height, start: plan.entrance, isFree: (x, y) => ".D".includes(plan.rows[y][x]) })
  for (const district of plan.districts) {
    const rect = district.rect
    if (rect[0] + rect[2] > width || rect[1] + rect[3] > height) {
      errors.push(`${district.symbol}: district is outside its study`)
      continue
    }
    for (const row of Array.from({ length: rect[3] }).keys())
      for (const column of Array.from({ length: rect[2] }).keys()) {
        const x = rect[0] + column,
          y = rect[1] + row,
          key = `${x},${y}`
        if (occupied.has(key) || plan.rows[y][x] !== district.symbol) errors.push(`${district.symbol}: district occupancy disagrees with its rectangle`)
        occupied.set(key, district.symbol)
      }
    const access = district.access
    if (
      !reachable.has(`${access[0]},${access[1]}`) ||
      !(
        ((access[0] === rect[0] - 1 || access[0] === rect[0] + rect[2]) && access[1] >= rect[1] && access[1] < rect[1] + rect[3]) ||
        ((access[1] === rect[1] - 1 || access[1] === rect[1] + rect[3]) && access[0] >= rect[0] && access[0] < rect[0] + rect[2])
      )
    )
      errors.push(`${district.symbol}: district has no connected adjacent access`)
  }
  for (const y of plan.rows.keys())
    for (const x of Array.from({ length: width }).keys())
      if (!"#.D~".includes(plan.rows[y][x]) && occupied.get(`${x},${y}`) !== plan.rows[y][x]) errors.push("District grid contains an unassigned reservation")

  return [...new Set(errors)]
}
