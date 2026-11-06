import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { MAX_LEVEL } from "#/world/core/growth-rules"
import { expToNext } from "#/world/core/exp-to-next"
import { derive } from "#/world/core/derive"
import { player } from "#/world/test/player"

it("reports no experience for a kill or a share once the level cap is reached", () => {
  const capped = player({ level: MAX_LEVEL, exp: 0 })
  const looted = apply(capped, { type: "loot", monster: "slime", exp: 9, items: [] })
  if (!looted.ok) throw Error(looted.reason)
  expect(looted.events[0]).toMatchObject({ type: "looted", exp: 0 })
  const shared = apply(capped, { type: "share", monster: "slime", exp: 9 })
  if (!shared.ok) throw Error(shared.reason)
  expect(shared.events[0]).toMatchObject({ type: "shared", exp: 0 })
  const below = apply(player({ level: MAX_LEVEL - 1 }), { type: "loot", monster: "slime", exp: 9, items: [] })
  expect(below.ok && below.events[0]).toMatchObject({ type: "looted", exp: 9 })
})

it.each<"loot" | "share">(["loot", "share"])("reports only the experience used when %s reaches the cap", (type) => {
  const start = player({ level: MAX_LEVEL - 1, exp: expToNext(MAX_LEVEL - 1) - 3, hp: 1, sp: 0 })
  const reward = apply(start, { type, monster: "slime", exp: 9, items: [] })
  if (!reward.ok) throw Error(reward.reason)
  expect(reward.events[0]).toMatchObject({ exp: 3, gained: 1, level: MAX_LEVEL })
  expect(reward.state.exp).toBe(0)
  expect(reward.state.hp).toBe(derive(reward.state).maxHp)
  expect(reward.state.sp).toBe(derive(reward.state).maxSp)
  expect(start.hp).toBe(1)
})

it("counts experience spent across multiple levels together with the remainder", () => {
  const start = player({ level: 1, exp: 4 })
  const exp = expToNext(1) - start.exp + expToNext(2) + 5
  const reward = apply(start, { type: "share", monster: "slime", exp })
  if (!reward.ok) throw Error(reward.reason)
  expect(reward.events[0]).toMatchObject({ exp, gained: 2, level: 3 })
  expect(reward.state.exp).toBe(5)
})
