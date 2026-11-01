import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { isMedicine } from "#/world/core/is-medicine"
import { MEDICINE_KEY, MEDICINE_WAIT_MS } from "#/world/core/medicine-rules"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

it("treats remedies as medicine and meals as food", () => {
  expect(isMedicine("herb")).toBe(true)
  expect(isMedicine("red-potion")).toBe(true)
  expect(isMedicine("blue-potion")).toBe(true)
  expect(isMedicine("stew")).toBe(false)
  expect(isMedicine("hot-water")).toBe(false)
})

it("makes every medicine wait for the last one, whatever it was", () => {
  const now = 100_000
  const p = player({ hp: 1, hpAt: now, sp: 0, spAt: now, bag: bagWith(["red-potion", 2], ["herb", 1], ["blue-herb", 1]) })
  const first = apply(p, { type: "use-item", item: "red-potion" }, { now })
  if (!first.ok) throw Error(first.reason)
  expect(first.state.ready[MEDICINE_KEY]).toBe(now + MEDICINE_WAIT_MS)
  expect(apply(first.state, { type: "use-item", item: "red-potion" }, { now: now + 1000 })).toEqual({ ok: false, reason: "MEDICINE_WAIT" })
  expect(apply(first.state, { type: "use-item", item: "herb" }, { now: now + 1000 })).toEqual({ ok: false, reason: "MEDICINE_WAIT" })
  expect(apply(first.state, { type: "use-item", item: "blue-herb" }, { now: now + MEDICINE_WAIT_MS - 1 })).toEqual({ ok: false, reason: "MEDICINE_WAIT" })
  expect(apply(first.state, { type: "use-item", item: "herb" }, { now: now + MEDICINE_WAIT_MS }).ok).toBe(true)
})

it("leaves food to fullness and does not start the medicine wait", () => {
  const now = 100_000
  const p = player({ hp: 1, hpAt: now, bag: bagWith(["roll", 2]) })
  const first = apply(p, { type: "use-item", item: "roll" }, { now })
  if (!first.ok) throw Error(first.reason)
  expect(first.state.ready[MEDICINE_KEY]).toBeUndefined()
  expect(apply(first.state, { type: "use-item", item: "roll" }, { now: now + 1 }).ok).toBe(true)
})
