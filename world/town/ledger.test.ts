import { describe, expect, it } from "vitest"
import { HOUSEHOLDS, HOUSES } from "./houses.ts"
import { RESIDENTS } from "./residents.ts"
import { DAILY_OUTPUT, MILLER, TRADE_FIRES, WATER_REACH, made, used, type Good } from "./ledger.ts"
import { MAPS } from "../maps/index.ts"
import { layoutOf } from "../maps/layouts.ts"
import { doorStep } from "../maps/siting.ts"
import type { V2 } from "../maps/layout.ts"

const segDist = (p: V2, a: V2, b: V2) => {
  const [dx, dz] = [b[0] - a[0], b[1] - a[1]]
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz || 1)))
  return Math.hypot(a[0] + dx * t - p[0], a[1] + dz * t - p[1])
}

describe("the town's day in numbers (economy.md「町の帳簿」)", () => {
  it("what is made in a day covers what is eaten and burnt", () => {
    for (const g of ["パン", "粉", "野菜", "おかず", "薪", "炭"] as Good[]) expect(made(g), g).toBeGreaterThanOrEqual(used(g))
  })

  it("every maker and the miller live in the town, and every fire is in a house that stands", () => {
    for (const name of [...Object.keys(DAILY_OUTPUT), MILLER]) expect(RESIDENTS.some((r) => r.name === name), name).toBe(true)
    for (const id of Object.keys(TRADE_FIRES)) expect(HOUSES.some((h) => h.id === id && h.kind !== "vacant"), id).toBe(true)
  })

  it("every lived house has a well or the river within reach of its door", () => {
    for (const h of HOUSES) {
      if (h.kind === "vacant" || !h.household) continue
      const step = doorStep(h)
      const wells = Object.entries(MAPS[h.map].places)
        .filter(([name]) => /well|Well|lavoir/.test(name))
        .map(([, c]): V2 => [c[0] / 2, c[1] / 2])
      const layout = layoutOf(h.map)
      let reach = Math.min(...wells.map((w) => Math.hypot(w[0] - step[0], w[1] - step[1])))
      if (layout.river[0][0] > -50) for (let i = 0; i < layout.river.length - 1; i++) reach = Math.min(reach, segDist(step, layout.river[i], layout.river[i + 1]) - layout.riverHW)
      expect(reach, `${h.id} (${h.name})`).toBeLessThanOrEqual(WATER_REACH)
    }
  })

  it("every household earns its keep: by a trade, a wage or the town's pension", () => {
    const earner = (n: string) => {
      const job = RESIDENTS.find((r) => r.name === n)?.job ?? ""
      return job !== "子ども" && !job.startsWith("隠居")
    }
    for (const hh of HOUSEHOLDS) expect(hh.members.some(earner) || /寄り合い|貸し賃/.test(hh.trade), hh.id).toBe(true)
  })
})
