import { expect, it } from "vitest"
import { emptyWild, hit } from "./wild.ts"
import { MONSTER_KINDS, SPAWNS } from "./monsters.ts"

it("rejects late strikes without rewards or mutations until the exact respawn time", () => {
  const spawn = SPAWNS[0]
  const kind = MONSTER_KINDS[spawn.kind]
  const killed = hit(emptyWild(), spawn.id, kind.hp, 1000, "hunter")
  expect(killed.beaten).toBe(true)
  const ready = killed.state.back[spawn.id]
  const snapshot = structuredClone(killed.state)
  for (const owner of ["hunter", "other"]) {
    const late = hit(killed.state, spawn.id, kind.hp, ready - 1, owner)
    expect(late).toMatchObject({ hp: 0, beaten: false, refused: true, reason: "TARGET_GONE" })
    expect(late.state).toBe(killed.state)
  }
  expect(killed.state).toEqual(snapshot)
  const returned = hit(killed.state, spawn.id, 1, ready, "other")
  expect(returned).toMatchObject({ hp: kind.hp - 1, beaten: false, refused: false })
  expect(returned.state.by[spawn.id].player).toBe("other")
  expect(hit(emptyWild(), "unknown", 1, 0, "hunter")).toMatchObject({ refused: true, reason: "TARGET_GONE" })
})
