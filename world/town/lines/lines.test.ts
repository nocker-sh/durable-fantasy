import { describe, expect, it } from "vitest"
import { phase } from "#/world/core/phase"
import type { Phase } from "#/world/core/clock-types"
import { RESIDENTS } from "#/world/town/residents"
import { fit } from "#/world/town/lines/fit"
import { pick } from "#/world/town/lines/pick"
import type { Situation } from "#/world/town/lines/line"
import { ALL_LINES } from "#/world/town/lines/index"
import { RELATIONS } from "#/world/town/people"
import { ROUTINES } from "#/world/town/routines"
import { slotAt } from "#/world/town/slot-at"

const EVERY = Array.from({ length: 96 }, (_, k) => k * 15)
const asleep = (name: string, m: number) => {
  const s = slotAt(name, ((m % 1440) + 1440) % 1440)
  return s?.where === "home" && s.doing.includes("眠")
}
const all = Object.entries(ALL_LINES).flatMap(([name, lines]) => lines.map((l) => ({ name, l })))

describe("what residents say", () => {
  it("everyone has plenty to say", () => {
    for (const r of RESIDENTS) expect(ALL_LINES[r.name]?.length ?? 0, r.name).toBeGreaterThanOrEqual(40)
  })

  it("no line is said twice, by anyone, and none runs long", () => {
    const seen = new Map<string, string>()
    for (const { name, l } of all) {
      expect(seen.get(l.text), `${name}: ${l.text}`).toBeUndefined()
      seen.set(l.text, name)
      expect(l.text.length, l.text).toBeLessThanOrEqual(60)
    }
  })

  it("keeps to the world: a town, the goddess and her monk, no strangers called travellers", () => {
    for (const { name, l } of all) for (const bad of [/村/, /旅の人/, /旅のお方/, /神父/, /商会/, /自治会/]) expect(bad.test(l.text), `${name}: ${l.text}`).toBe(false)
  })

  it("speaks of people nearby only if they know them, and of doings that are theirs", () => {
    for (const { name, l } of all) {
      if (l.near)
        expect(
          RELATIONS.some((r) => (r.a === name && r.b === l.near) || (r.b === name && r.a === l.near)),
          `${name} → ${l.near}`,
        ).toBe(true)
      if (l.doing)
        expect(
          (ROUTINES[name] ?? []).some((s) => s.doing.includes(l.doing!)),
          `${name}: doing ${l.doing}`,
        ).toBe(true)
    }
  })

  it("a line for a time of day is for a time they are up", () => {
    for (const { name, l } of all) {
      if (!l.phase) continue
      const up = (p: Phase) => EVERY.some((m) => phase(m) === p && !asleep(name, m))
      expect(l.phase.some(up), `${name} [${l.phase}]: ${l.text}`).toBe(true)
    }
  })

  it("good morning is said by someone just up, at the part of the day they get up", () => {
    for (const { name, l } of all) {
      if (!/^おはよう(?!、か)/.test(l.text)) continue // a greeting of their own, not one they answer
      expect(l.phase ?? l.doing, `${name}: ${l.text} needs a time of day or a doing`).toBeDefined()
      const when = (m: number) => (l.phase ? l.phase.includes(phase(m)) : true) && (l.doing ? !!slotAt(name, m)?.doing.includes(l.doing) : true)
      const justUp = EVERY.some((m) => when(m) && !asleep(name, m) && [60, 120, 180, 240, 300].some((d) => asleep(name, m - d)))
      expect(justUp, `${name} [${l.phase}]: ${l.text}`).toBe(true)
    }
  })

  it("the best-fitting line comes first, and a conversation never repeats itself", () => {
    const s: Situation = { phase: "夜", doing: "夜市で揚げ菓子を売る", nearby: new Set(), friend: 0, event: "寒波", firstTime: false }
    const pages = pick({ lines: ALL_LINES["エルザ"], s: s, pages: 3, seed: 7 })
    expect(new Set(pages).size).toBe(pages.length)
    const top = ALL_LINES["エルザ"].find((l) => l.text === pages[0])!
    expect(fit(top, s)).toBeGreaterThan(0)
  })
})
