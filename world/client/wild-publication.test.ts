import { expect, it, vi } from "vitest"
import { currentCreature } from "#/world/client/current-creature"
import { mergeWild } from "#/world/client/merge-wild"
import { ServerMessages } from "#/world/client/server-messages"
import { GameSession } from "#/world/client/game-session"
import type { CreatureHealth } from "#/world/core/wild/types"
import { serverMessage } from "#/world/protocol"

function fixture(visible = true) {
  const session = new GameSession()
  const scene = { struck: vi.fn(), setWild: vi.fn(), stopFight: vi.fn() }
  const messages = new ServerMessages({ session, getScene: () => (visible ? scene : null) } as unknown as ConstructorParameters<typeof ServerMessages>[0])
  return {
    session,
    scene,
    snapshot: (revision: number, monsters: Record<string, CreatureHealth>) => messages.handle({ type: "wild", revision, monsters }),
    hit: (monster: string, revision: number, hp: number, back = 0) => messages.handle({ type: "struck", by: "player", monster, revision, hp, back, swing: { kind: "hit", damage: 10 } }),
  }
}
it.each([true, false])("merges delayed snapshots per creature without reviving a defeated target, including before scene creation: %s", (visible) => {
  const f = fixture(visible)
  f.snapshot(1, { first: { hp: 20, back: 0 }, second: { hp: 15, back: 0 } })
  f.hit("first", 3, 0, 5000)
  f.snapshot(2, { first: { hp: 20, back: 0 }, second: { hp: 9, back: 0 } })
  expect(f.session.wild).toEqual({ first: { hp: 0, back: 5000, revision: 3 }, second: { hp: 9, back: 0, revision: 2 } })
  if (visible) expect(f.scene.setWild).toHaveBeenLastCalledWith(f.session.wild)
})
it("accepts an unseen earlier hit on another creature but rejects old or repeated hits on the same creature", () => {
  const f = fixture()
  f.hit("second", 4, 7)
  f.hit("first", 3, 10)
  f.hit("first", 3, 10)
  f.hit("first", 2, 20)
  expect(f.session.wild).toEqual({ first: { hp: 10, back: 0, revision: 3 }, second: { hp: 7, back: 0, revision: 4 } })
  expect(f.scene.struck).toHaveBeenCalledTimes(2)
})
it("does not reapply a delayed kill after authoritative respawn or stop the new fight", () => {
  const f = fixture()
  f.hit("first", 3, 0, 5000)
  f.snapshot(4, { first: { hp: 20, back: 5000 } })
  f.session.fighting = { monster: "first", at: 6000 }
  f.hit("first", 3, 0, 5000)
  expect(f.session.wild.first).toEqual({ hp: 20, back: 5000, revision: 4 })
  expect(f.session.fighting?.monster).toBe("first")
  expect(f.scene.struck).toHaveBeenCalledOnce()
})
it("ends only the fight whose target is confirmed defeated by a fresh snapshot", () => {
  const f = fixture()
  f.session.fighting = { monster: "second", at: 1000 }
  f.snapshot(1, { first: { hp: 0, back: 5000 }, second: { hp: 15, back: 0 } })
  expect(f.session.fighting?.monster).toBe("second")
  expect(f.scene.stopFight).not.toHaveBeenCalled()
  f.snapshot(2, { second: { hp: 0, back: 6000 } })
  expect(f.session.fighting).toBeNull()
  expect(f.scene.stopFight).toHaveBeenCalledExactlyOnceWith("second")
})
it("keeps an already versioned creature intact when receiving an unnumbered legacy update", () => {
  const current = { first: { hp: 0, back: 5000, revision: 2 } }
  expect(mergeWild(current, { first: { hp: 20, back: 0 } })).toBe(current)
  expect(mergeWild({}, { first: { hp: 20, back: 0 } })).toEqual({ first: { hp: 20, back: 0 } })
})
it.each([-1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1])("rejects invalid snapshot revision %s at the wire and merge boundaries", (revision) => {
  const current = { first: { hp: 10, back: 0, revision: 1 } }
  expect(serverMessage.safeParse({ type: "wild", revision, monsters: {} }).success).toBe(false)
  expect(currentCreature(current.first, revision)).toBe(false)
  expect(mergeWild(current, { first: { hp: 20, back: 0 } }, revision)).toBe(current)
})
