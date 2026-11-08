import { expect, it } from "vitest"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { hit } from "#/world/core/wild/hit"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"

it("rejects late strikes without rewards or mutations until the exact respawn time", () => {
  const spawn = SPAWNS[0]
  const kind = MONSTER_KINDS[spawn.kind]
  const killed = hit({ state: emptyWild(), id: spawn.id, damage: kind.hp, now: 1000, player: "hunter" })
  expect(killed.beaten).toBe(true)
  const ready = killed.state.back[spawn.id]
  const snapshot = structuredClone(killed.state)
  for (const owner of ["hunter", "other"]) {
    const late = hit({ state: killed.state, id: spawn.id, damage: kind.hp, now: ready - 1, player: owner })
    expect(late).toMatchObject({ hp: 0, beaten: false, refused: true, reason: "TARGET_GONE" })
    expect(late.state).toBe(killed.state)
  }
  expect(killed.state).toEqual(snapshot)
  const returned = hit({ state: killed.state, id: spawn.id, damage: 1, now: ready, player: "other" })
  expect(returned).toMatchObject({ hp: kind.hp - 1, beaten: false, refused: false })
  expect(returned.state.by[spawn.id].player).toBe("other")
  expect(hit({ state: emptyWild(), id: "unknown", damage: 1, now: 0, player: "hunter" })).toMatchObject({ refused: true, reason: "TARGET_GONE" })
})
