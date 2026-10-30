import { expect, it, vi } from "vitest"
import { ServerMessages } from "#/world/client/server-messages"

type Context = ConstructorParameters<typeof ServerMessages>[0]
it("limits a delayed attack refusal to its original creature", () => {
  const session = {
    net: { messages: 0, bytes: 0, since: 0 },
    fighting: { monster: "next", at: 1000 } as { monster: string; at: number } | null,
  }
  const stopFight = vi.fn()
  const stop = vi.fn()
  const notify = vi.fn()
  const messages = new ServerMessages({ session, notify, getScene: () => ({ stopFight, stop }) } as unknown as Context)
  messages.handle({ type: "refused", what: "attack", monster: "previous", reason: "TARGET_GONE" })
  expect(session.fighting?.monster).toBe("next")
  expect(stopFight).toHaveBeenCalledExactlyOnceWith("previous")
  expect(stop).not.toHaveBeenCalled()
  messages.handle({ type: "refused", what: "attack", monster: "next", reason: "EXHAUSTED" })
  expect(session.fighting).toBeNull()
  expect(stopFight).toHaveBeenLastCalledWith("next")
})

it.each([false, true])("retains monster updates and clears only the defeated target, including without a scene: %s", (visible) => {
  const session = {
    net: { messages: 0, bytes: 0, since: 0 },
    wild: { first: { hp: 20, back: 0 }, second: { hp: 15, back: 0 } },
    fighting: { monster: "first", at: 1000 } as { monster: string; at: number } | null,
  }
  const struck = vi.fn()
  const setWild = vi.fn()
  const messages = new ServerMessages({ session, getScene: () => (visible ? { struck, setWild } : null) } as unknown as Context)
  const hit = (monster: string, hp: number, back: number) => messages.handle({ type: "struck", by: "player", monster, hp, back, swing: { kind: "hit", damage: 10 } })
  hit("first", 10, 0)
  expect(session.wild.first).toEqual({ hp: 10, back: 0 })
  expect(session.fighting?.monster).toBe("first")
  hit("second", 0, 5000)
  expect(session.wild.second).toEqual({ hp: 0, back: 5000 })
  expect(session.fighting?.monster).toBe("first")
  hit("first", 0, 6000)
  expect(session.wild.first).toEqual({ hp: 0, back: 6000 })
  expect(session.fighting).toBeNull()
  const recovered = { first: { hp: 20, back: 6000 }, second: { hp: 15, back: 5000 } }
  messages.handle({ type: "wild", monsters: recovered })
  expect(session.wild).toEqual(recovered)
  expect(setWild).toHaveBeenCalledTimes(visible ? 1 : 0)
  if (visible) expect(setWild).toHaveBeenCalledWith(recovered)
  // A later hit after respawning replaces the old respawn deadline.
  hit("first", 10, 0)
  expect(session.wild.first).toEqual({ hp: 10, back: 0 })
  expect(struck).toHaveBeenCalledTimes(visible ? 4 : 0)
})
