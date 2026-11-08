import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { derive } from "#/world/core/derive"
import { REGEN_MS } from "#/world/core/player-rules"
import { settle } from "#/world/core/settle"
import { player } from "#/world/test/player"

it("starts both recovery clocks on revival without recovering SP for time spent fallen", () => {
  const start = player({ hp: 1, hpAt: 1000, sp: 0, spAt: 1000 })
  const fallen = apply(start, { type: "hurt", amount: 1, by: "スライム" }, { now: 1001 })
  if (!fallen.ok) throw Error(fallen.reason)
  const revivedAt = 1001 + REGEN_MS * 10
  const stats = derive(start)
  expect(settle(fallen.state, stats, revivedAt)).toBe(fallen.state)
  const revived = apply(fallen.state, { type: "revive" }, { now: revivedAt })
  if (!revived.ok) throw Error(revived.reason)
  expect(revived.state).toMatchObject({ hp: Math.floor(stats.maxHp / 2), sp: 0 })
  expect(settle(revived.state, stats, revivedAt + REGEN_MS - 1)).toMatchObject({ hp: revived.state.hp, sp: 0 })
  expect(settle(revived.state, stats, revivedAt + REGEN_MS)).toMatchObject({ hp: revived.state.hp + stats.regenHp, sp: stats.regenSp })
})
