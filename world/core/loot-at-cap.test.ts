import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { MAX_LEVEL } from "#/world/core/growth-rules"
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
