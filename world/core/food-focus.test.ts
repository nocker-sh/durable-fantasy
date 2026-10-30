import { expect, it } from "vitest"
import { apply } from "./apply"
import { addItem } from "#/world/core/add-item"
import { emptyBag } from "#/world/core/empty-bag"
import { effectOf } from "#/world/core/effect-of"
import { loadPlayer } from "#/world/core/load-player"
import { settle } from "#/world/core/settle"
import { player } from "#/world/test/player"

const rest = { maxHp: 100, maxSp: 100, regenHp: 1, regenSp: 2 }

it("applies only to recovery ticks after eating and before expiration, even across a long absence", () => {
  const p = player({ hp: 10, sp: 0, hpAt: 1000, spAt: 1000, focusAt: 25000, focusUntil: 65000 })
  const later = settle(p, rest, 101000)
  expect(later.hp).toBe(15)
  expect(later.sp).toBe(12)
  expect(settle(settle(p, rest, 41000), rest, 101000)).toEqual(later)
  expect(settle({ ...p, focusUntil: 61000 }, rest, 101000).sp).toBe(11)
  expect(settle({ ...p, hp: 0 }, rest, 101000)).toMatchObject({ hp: 0, sp: 0 })
  expect(settle({ ...p, sitting: true }, rest, 101000).sp).toBe(22)
  expect(settle({ ...p, sp: 99 }, rest, 101000).sp).toBe(100)
})

it("food grants focus, preserves a longer existing duration, and starts a fresh interval after expiry", () => {
  const p = player({ bag: addItem({ bag: emptyBag(), item: "herb-tea", count: 3 })! })
  const eaten = apply(p, { type: "use", slot: 0 }, { now: 1000 })
  expect(eaten.ok).toBe(true)
  if (!eaten.ok) return
  const until = 1000 + effectOf("herb-tea").focus * 60000
  expect(eaten.state).toMatchObject({ focusAt: 1000, focusUntil: until })
  const longer = apply({ ...eaten.state, focusUntil: until * 2 }, { type: "use", slot: 0 }, { now: 2000 })
  expect(longer.ok && longer.state).toMatchObject({ focusAt: 1000, focusUntil: until * 2 })
  const again = apply(eaten.state, { type: "use", slot: 0 }, { now: until })
  expect(again.ok && again.state.focusAt).toBe(until)
  expect(effectOf("herb-tea", 3).focus).toBeGreaterThan(effectOf("herb-tea", 0).focus)
})

it("loads old saves without granting focus and retains active effects in new saves", () => {
  const p = player({ focusAt: 1000, focusUntil: 60000 })
  expect(loadPlayer(p)).toMatchObject({ focusAt: 1000, focusUntil: 60000 })
  const { focusAt: _, focusUntil: __, ...old } = p
  expect(loadPlayer(old)).toMatchObject({ focusAt: 0, focusUntil: 0 })
})
