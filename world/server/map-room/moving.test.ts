import { afterEach, expect, it, vi } from "vitest"
import type { Ctx } from "./context.ts"
import { mapPlayer, type Presence } from "./presence.ts"
import { player } from "../../test/helpers.ts"
import type { Cell } from "../../protocol.ts"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const walk = vi.hoisted(() => vi.fn(async () => true))
vi.mock("../../../durable-objects/player.ts", () => ({ Player: { get: () => ({ walk }) } }))
vi.mock("../../maps/index.ts", async (original) => ({
  ...(await original<typeof import("../../maps/index.ts")>()),
  walkable: (_map: unknown, cell: Cell) => cell.every((n) => n >= 0 && n < 96),
}))
import { HANDLERS } from "./moving.ts"
afterEach(() => {
  vi.useRealTimers()
  walk.mockClear()
})

it("keeps receipt time through slow persistence so a following route is reachable", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(10000)
  let state: Presence = { owner: "owner", player: mapPlayer("connection", player(), [10, 10]), route: [[10, 10]], since: 10000, said: [], engaged: null }
  const send = vi.fn(async () => {})
  const context = (receivedAt: number) =>
    ({
      ctx: { connection: { id: "connection", send }, room: { broadcast: vi.fn(async () => {}) } },
      map: {},
      me: state,
      receivedAt,
      save: (patch: Partial<Presence>) => {
        state = { ...state, ...patch }
      },
      standUp: async () => {
        vi.setSystemTime(Date.now() + 1000)
      },
    }) as unknown as Ctx
  const path: Cell[] = Array.from({ length: 12 }, (_, i) => [10 + i, 10])
  await HANDLERS.move!(context(10000), { type: "move", path })
  expect(state.since).toBe(10000)
  expect(walk).toHaveBeenLastCalledWith("connection", path, 10000)
  await HANDLERS.move!(context(10600), { type: "move", path: path.slice(3) })
  expect(send).not.toHaveBeenCalled()
  expect(state.route).toEqual(path.slice(3))
  expect(state.since).toBe(10600)
  // Receipt time does not permit jumping beyond the legal movement window.
  await HANDLERS.move!(context(10601), { type: "move", path: [[80, 80]] })
  expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: "refused", what: "move" }))
})
