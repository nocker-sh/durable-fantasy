import { afterEach, expect, it, vi } from "vitest"
import { choicesFor, linesFor } from "./dialogue"
import { createGameState } from "../client/initial-state"
import { player, bagWith } from "../test/helpers"
import { dayOf, errandProgress } from "../core/errands"
import { ALL_LINES } from "../town/lines"
import { errandOf } from "../core/errands"

const now = Date.UTC(2026, 9, 26, 12)
const taken = (id: string, done = false) => ({ id, day: dayOf(now), done })
afterEach(() => vi.unstubAllGlobals())

it("distinguishes missing supplies, ready supplies and completed errands without changing progress", () => {
  const p = player({ errands: [taken("irmgard-herbs")], bag: bagWith(["blue-herb", 1]) })
  expect(errandProgress(p, "イルムガルト", now)).toEqual({ "irmgard-herbs": "taken" })
  const ready = { ...p, bag: bagWith(["blue-herb", 2]) }
  expect(errandProgress(ready, "イルムガルト", now)).toEqual({ "irmgard-herbs": "ready" })
  expect(ready.errands[0].done).toBe(false)
  expect(errandProgress({ ...ready, errands: [taken("irmgard-herbs", true)] }, "イルムガルト", now)).toEqual({ "irmgard-herbs": "done" })
  expect(errandProgress(ready, "ゲルダ", now)).toEqual({})
  expect(errandProgress(ready, "イルムガルト", now + 86400000)).toEqual({})
})

it("lets only the recipient receive a delivery and both participants remember completion", () => {
  const p = player({ errands: [taken("ulrike-eggs")] })
  expect(errandProgress(p, "ウルリケ", now)).toEqual({ "ulrike-eggs": "taken" })
  expect(errandProgress(p, "マルタ", now)).toEqual({ "ulrike-eggs": "ready" })
  const done = { ...p, errands: [taken("ulrike-eggs", true)] }
  for (const name of ["ウルリケ", "マルタ"]) expect(errandProgress(done, name, now)).toEqual({ "ulrike-eggs": "done" })
})

it("selects actual resident lines for the current task and excludes premature thanks", () => {
  vi.stubGlobal("localStorage", { getItem: () => '["イルムガルト"]', setItem: vi.fn() })
  const state = { ...createGameState().get(), player: player({ errands: [taken("irmgard-herbs")], bag: bagWith(["blue-herb", 2]) }) }
  const ready = ALL_LINES["イルムガルト"].find((line) => line.errand?.state === "ready")!.text
  const done = ALL_LINES["イルムガルト"].find((line) => line.errand?.state === "done")!.text
  expect(linesFor(state, "イルムガルト", "spoken", now)).toContain(ready)
  expect(linesFor(state, "イルムガルト", "spoken", now)).not.toContain(done)
  state.player = { ...state.player, errands: [taken("irmgard-herbs", true)] }
  expect(linesFor(state, "イルムガルト", "spoken", now)).toContain(done)
  expect(linesFor(state, "イルムガルト", "spoken", now)).not.toContain(ready)
})

it("references existing errands involving the speaker", () => {
  for (const [name, lines] of Object.entries(ALL_LINES))
    for (const line of lines) {
      if (!line.errand) continue
      const errand = errandOf(line.errand.id)
      expect(errand).toBeDefined()
      expect([errand!.from, errand!.to]).toContain(name)
    }
})

it.each(["taken", "ready", "done"] as const)("the smith responds to scrap progress: %s", (progress) => {
  vi.stubGlobal("localStorage", { getItem: () => '["ギュンター"]', setItem: vi.fn() })
  const state = {
    ...createGameState().get(),
    player: player({ errands: [taken("gunter-scrap", progress === "done")], bag: bagWith(["rusty-scrap", progress === "ready" ? 3 : 1]) }),
  }
  const selected = linesFor(state, "ギュンター", "spoken", now)
  for (const line of ALL_LINES["ギュンター"].filter((line) => line.errand?.id === "gunter-scrap")) {
    if (line.errand!.state === progress) expect(selected).toContain(line.text)
    else expect(selected).not.toContain(line.text)
  }
})

it("offers the chapel commission while the monk is at his counter", () => {
  const base = createGameState().get()
  const at = (min: number) => ({ ...base, player: player(), clock: { ...base.clock, min } })
  expect(choicesFor(at(18 * 60), "ベネディクト")).toContainEqual({ label: "仕事を頼む", action: "commission" })
  expect(choicesFor(at(8 * 60), "ベネディクト").some((choice) => choice.action === "commission")).toBe(false)
})

it("offers shopping only with the on-duty keeper of a shared shop", () => {
  const base = createGameState().get()
  const state = { ...base, player: player(), clock: { ...base.clock, min: 18 * 60 } }
  expect(choicesFor(state, "ハンス")).toContainEqual({ label: "買い物をする", action: "shop" })
  expect(choicesFor(state, "マルタ").some((choice) => choice.action === "shop")).toBe(false)
})

it.each(["beatrix-ingots", "gottfried-logs", "rudolf-fur"])("keeps the craftsperson's dialogue in step with %s", (id) => {
  const errand = errandOf(id)!
  vi.stubGlobal("localStorage", { getItem: () => JSON.stringify([errand.from]), setItem: vi.fn() })
  const state = { ...createGameState().get(), player: player() }
  const lines = ALL_LINES[errand.from].filter((line) => line.errand?.id === id)
  expect(lines).toHaveLength(3)
  for (const progress of ["taken", "ready", "done"] as const) {
    state.player = player({ errands: [taken(id, progress === "done")], bag: progress === "ready" ? bagWith([errand.wants!.item, errand.wants!.count]) : player().bag })
    const pages = linesFor(state, errand.from, "spoken", now)
    for (const line of lines) {
      if (line.errand!.state === progress) expect(pages).toContain(line.text)
      else expect(pages).not.toContain(line.text)
    }
  }
  const tomorrow = linesFor(state, errand.from, "spoken", now + 86400000)
  for (const line of lines) expect(tomorrow).not.toContain(line.text)
})
