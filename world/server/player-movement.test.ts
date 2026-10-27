import { afterEach, expect, it, vi } from "vitest"
import { Player } from "../../durable-objects/player.ts"
import { player } from "../test/helpers.ts"
import type { Cell } from "../protocol.ts"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => vi.useRealTimers())

function fixture() {
  const saved = new Map<string, unknown>([
    [
      "__void_durable_state",
      {
        __voidDurableState: true,
        version: 2,
        value: {
          player: player({ hp: 10, hpAt: 1000 }),
          credential: "test-credential",
          location: { world: 1, map: "south-meadow", route: [[10, 10]], since: 1000, connection: "connection" },
          trade: null,
          tradeJob: null,
        },
      },
    ],
  ])
  let fail = false
  const state = {
    id: { toString: () => "test-player" },
    blockConcurrencyWhile: <T>(fn: () => Promise<T>) => fn(),
    storage: {
      get: async (key: string) => structuredClone(saved.get(key)),
      put: async (key: string, value: unknown) => {
        if (fail) {
          fail = false
          throw Error("Storage unavailable")
        }
        saved.set(key, structuredClone(value))
      },
    },
  }
  return {
    restart: () => new Player.class(state as unknown as DurableObjectState, {}),
    failNextSave: () => {
      fail = true
    },
  }
}

const route: Cell[] = [
  [10, 10],
  [11, 10],
  [12, 10],
  [13, 10],
]

it("persists the place of a fall and rejects movement until revival, including after restart", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const f = fixture(),
    p = f.restart()
  expect(await p.walk("connection", route)).toBe(true)
  vi.setSystemTime(1250) // one whole cell traversed, the next still pending
  const fallen = await p.run({ type: "hurt", amount: 100, by: "スライム" })
  expect(fallen.ok && fallen.state.hp).toBe(0)
  expect(
    await p.walk("connection", [
      [11, 10],
      [12, 10],
    ]),
  ).toBe(false)
  expect(await p.travel("connection", "phanthiet", [20, 20])).toBe(false)
  vi.setSystemTime(10000)
  const resumed = f.restart()
  expect(await resumed.arrive(1, "south-meadow", "new-connection")).toMatchObject({ accepted: true, at: [11, 10] })
  expect(await resumed.walk("new-connection", route)).toBe(false)
  const revived = await resumed.run({ type: "revive" })
  if (!revived.ok) throw Error(revived.reason)
  expect(revived.state.hp).toBeGreaterThan(0)
  expect(await resumed.travel("new-connection", revived.state.savePoint.map, revived.state.savePoint.cell as Cell)).toBe(true)
  await resumed.arrive(1, revived.state.savePoint.map, "town-connection")
  expect(await resumed.walk("old-connection", route)).toBe(false)
  expect(await resumed.walk("town-connection", route)).toBe(true)
})

it("rolls back the fall and frozen location together if saving fails", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const f = fixture(),
    p = f.restart()
  await p.walk("connection", route)
  vi.setSystemTime(1250)
  f.failNextSave()
  await expect(p.run({ type: "hurt", amount: 100, by: "スライム" })).rejects.toThrow("Storage unavailable")
  expect((await p.read()).hp).toBe(10)
  vi.setSystemTime(10000)
  const resumed = f.restart()
  expect((await resumed.read()).hp).toBe(10)
  expect(await resumed.arrive(1, "south-meadow", "new-connection")).toMatchObject({ accepted: true, at: [13, 10] })
})
