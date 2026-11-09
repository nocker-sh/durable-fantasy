import { expect, it } from "vitest"
import { phase } from "#/world/core/phase"
import { shopOpen } from "#/world/maps/shop-open"
import { ALL_LINES } from "#/world/town/lines/index"
import type { Line } from "#/world/town/lines/line"
import { slotAt } from "#/world/town/slot-at"

const DAY = Array.from({ length: 1440 }, (_, minute) => minute)
const clock = (minute: number) => `${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, "0")}`
const doingOf = (name: string, minute: number) => slotAt(name, minute)?.doing ?? ""

// out where the player can meet them, with the line's conditions met (parts/lines-for.ts)
const heardAt = (name: string, line: Line, minute: number) => {
  const slot = slotAt(name, minute)
  if (!slot || slot.where === "home") return false
  if (line.phase && !line.phase.includes(phase(minute))) return false
  return !line.doing || slot.doing.includes(line.doing)
}

it("the day keeper and her daughter share supper at home, and what she buys at the night market is for the next one", () => {
  expect(ALL_LINES["ヘレナ"].some((line) => line.text.includes("娘と二人の食卓"))).toBe(true)
  const supper = DAY.filter((minute) =>
    ["ヘレナ", "リーゼル"].every((name) => {
      const slot = slotAt(name, minute)
      return slot?.where === "home" && slot.doing.includes("夕餉")
    }),
  )
  const shopping = DAY.filter((minute) => doingOf("ヘレナ", minute).includes("夜市で買い物"))
  expect(supper.length).toBeGreaterThan(0)
  expect(Math.max(...supper)).toBeLessThan(Math.min(...shopping))
  expect(ALL_LINES["ヘレナ"].filter((line) => line.doing === "買い物" && line.text.includes("今夜")).map((line) => line.text)).toEqual([])
})

it("what the day keeper says of the night market and of her daughter is true whenever she can say it", () => {
  const claims = [
    { says: /夜市/, holds: (minute: number) => doingOf("ヘレナ", minute).includes("夜市") },
    { says: /リーゼルは(今ごろ|もう)/, holds: (minute: number) => /井戸|湯/.test(doingOf("リーゼル", minute)) },
    { says: /リーゼルは(まだ)?眠って/, holds: (minute: number) => doingOf("リーゼル", minute).includes("眠") },
  ]
  const missing = claims.filter((claim) => !ALL_LINES["ヘレナ"].some((line) => claim.says.test(line.text))).map((claim) => `${claim.says}`)
  const untrue = claims.flatMap((claim) =>
    ALL_LINES["ヘレナ"]
      .filter((line) => claim.says.test(line.text))
      .flatMap((line) => {
        const minute = DAY.find((m) => heardAt("ヘレナ", line, m) && !claim.holds(m))
        return minute === undefined ? [] : [`${clock(minute)}: ${line.text}`]
      }),
  )
  expect({ missing, untrue }).toEqual({ missing: [], untrue: [] })
})

it("the tailor's seamstress hems at its door while the shop is shut by day, and does not say she keeps it then", () => {
  const byDay = DAY.filter((minute) => phase(minute) === "昼" && slotAt("ネーレ", minute)?.where === "work")
  expect(byDay.length).toBeGreaterThan(0)
  expect(byDay.filter((minute) => shopOpen("tailor", minute)).map(clock)).toEqual([])
  expect(ALL_LINES["ネーレ"].filter((line) => /昼番|昼はあたし/.test(line.text)).map((line) => line.text)).toEqual([])
})
