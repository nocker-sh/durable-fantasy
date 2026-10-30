import { afterEach, expect, it, vi } from "vitest"
import { Player } from "../../durable-objects/player"
import { player } from "#/world/test/player"
import type { Cell } from "#/world/protocol"

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
  expect(await p.walk({ connection: "connection", route: route })).toBe(true)
  vi.setSystemTime(1250) // one whole cell traversed, the next still pending
  const fallen = await p.run({ type: "hurt", amount: 100, by: "スライム" })
  expect(fallen.ok && fallen.state.hp).toBe(0)
  expect(
    await p.walk({
      connection: "connection",
      route: [
        [11, 10],
        [12, 10],
      ],
    }),
  ).toBe(false)
  expect(await p.travel({ connection: "connection", map: "phanthiet", at: [20, 20] })).toBe(false)
  vi.setSystemTime(10000)
  const resumed = f.restart()
  expect(await resumed.arrive({ world: 1, map: "south-meadow", connection: "new-connection" })).toMatchObject({ accepted: true, at: [11, 10] })
  expect(await resumed.walk({ connection: "new-connection", route: route })).toBe(false)
  const revived = await resumed.run({ type: "revive" })
  if (!revived.ok) throw Error(revived.reason)
  expect(revived.state.hp).toBeGreaterThan(0)
  expect(await resumed.travel({ connection: "new-connection", map: revived.state.savePoint.map, at: revived.state.savePoint.cell as Cell })).toBe(true)
  await resumed.arrive({ world: 1, map: revived.state.savePoint.map, connection: "town-connection" })
  expect(await resumed.walk({ connection: "old-connection", route: route })).toBe(false)
  expect(await resumed.walk({ connection: "town-connection", route: route })).toBe(true)
})

it("rolls back the fall and frozen location together if saving fails", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const f = fixture(),
    p = f.restart()
  await p.walk({ connection: "connection", route: route })
  vi.setSystemTime(1250)
  f.failNextSave()
  await expect(p.run({ type: "hurt", amount: 100, by: "スライム" })).rejects.toThrow("Storage unavailable")
  expect((await p.read()).hp).toBe(10)
  vi.setSystemTime(10000)
  const resumed = f.restart()
  expect((await resumed.read()).hp).toBe(10)
  expect(await resumed.arrive({ world: 1, map: "south-meadow", connection: "new-connection" })).toMatchObject({ accepted: true, at: [13, 10] })
})
