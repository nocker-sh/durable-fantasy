import { expect, it, vi } from "vitest"
import { ServerMessages } from "./server-messages.ts"

type Context = ConstructorParameters<typeof ServerMessages>[0]
it.each([false, true])("retains monster updates and clears only the defeated target, including without a scene: %s", (visible) => {
  const session = {
    net: { messages: 0, bytes: 0, since: 0 },
    wild: { first: { hp: 20, back: 0 }, second: { hp: 15, back: 0 } },
    fighting: { monster: "first", at: 1000 } as { monster: string; at: number } | null,
  }
  const struck = vi.fn()
  const messages = new ServerMessages({ session, getScene: () => (visible ? { struck } : null) } as unknown as Context)
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
  // A later hit after respawning replaces the old respawn deadline.
  hit("first", 10, 0)
  expect(session.wild.first).toEqual({ hp: 10, back: 0 })
  expect(struck).toHaveBeenCalledTimes(visible ? 4 : 0)
})
