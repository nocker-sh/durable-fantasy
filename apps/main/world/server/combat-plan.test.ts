import { expect, it, vi } from "vitest"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { planCombat } from "#/world/server/combat-plan"

const audience = { party: null, near: [], level: 1, life: 4, defense: { atk: 1, def: 0, hit: 1, flee: 0, crit: 0 } }
const plan = (counters: number) =>
  planCombat({ players: vi.fn(), parties: vi.fn(), owner: "hunter", monster: "slime-0", kind: MONSTER_KINDS.slime, beaten: false, counters, audience, random: () => 0 })

it("rolls each of the creature's blows that fell due and delivers them as one hurt", async () => {
  expect(await plan(0)).toEqual({ life: 4, effects: [] })
  const one = await plan(1)
  const two = await plan(2)
  expect(one.counter).toEqual({ kind: "hit", damage: 3 })
  expect(two.counter).toEqual({ kind: "hit", damage: 6 })
  expect(two.effects).toEqual([{ owner: "hunter", life: 4, command: { type: "hurt", amount: 6, by: MONSTER_KINDS.slime.name } }])
})
