import { afterEach, expect, it, vi } from "vitest"
import type { Ctx } from "#/world/server/map-room/context"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import { player } from "#/world/test/player"
import type { Cell } from "#/world/protocol"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const walk = vi.hoisted(() => vi.fn(async () => true))
const reviveAtHome = vi.hoisted(() => vi.fn())
vi.mock("../../../durable-objects/player", () => ({ Player: { get: () => ({ walk, reviveAtHome }) } }))
vi.mock("#/world/maps/walkable", () => ({
  walkable: (_map: unknown, cell: Cell) => cell.every((n) => n >= 0 && n < 96),
}))
import { HANDLERS } from "#/world/server/map-room/moving"
afterEach(() => {
  vi.useRealTimers()
  walk.mockClear()
  reviveAtHome.mockReset()
  vi.restoreAllMocks()
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
        return true
      },
    }) as unknown as Ctx
  const path: Cell[] = Array.from({ length: 12 }, (_, i) => [10 + i, 10])
  await HANDLERS.move!(context(10000), { type: "move", path })
  expect(state.since).toBe(10000)
  expect(walk).toHaveBeenLastCalledWith({ connection: "connection", route: path, since: 10000 })
  await HANDLERS.move!(context(10600), { type: "move", path: path.slice(3) })
  expect(send).not.toHaveBeenCalled()
  expect(state.route).toEqual(path.slice(3))
  expect(state.since).toBe(10600)
  // Receipt time does not permit jumping beyond the legal movement window.
  await HANDLERS.move!(context(10601), { type: "move", path: [[80, 80]] })
  expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: "refused", what: "move" }))
})

it("sends the saved return destination even when the recovered-state notice fails", async () => {
  const p = player({ hp: 10 })
  reviveAtHome.mockResolvedValue({ ok: true, state: p, events: [] })
  vi.spyOn(console, "warn").mockImplementation(() => {})
  const send = vi.fn(async () => {}).mockRejectedValueOnce(Error("Lost result"))
  const save = vi.fn()
  const context = { ctx: { connection: { id: "connection", send } }, me: { owner: "owner", player: mapPlayer("connection", player({ hp: 0 }), [0, 0]), down: true }, save } as unknown as Ctx
  await HANDLERS.revive!(context, { type: "revive" })
  expect(reviveAtHome).toHaveBeenCalledExactlyOnceWith("connection")
  expect(save).toHaveBeenCalledExactlyOnceWith({ down: false, sitting: false })
  expect(send).toHaveBeenLastCalledWith({ type: "warped", map: p.savePoint.map, at: p.savePoint.cell })
})
it("does not clear the fallen presence or warp when the saved revival is refused", async () => {
  reviveAtHome.mockResolvedValue({ ok: false, reason: "NOT_READY" })
  const send = vi.fn(async () => {}),
    save = vi.fn()
  const context = { ctx: { connection: { id: "connection", send } }, me: { owner: "owner", player: mapPlayer("connection", player({ hp: 0 }), [0, 0]), down: true }, save } as unknown as Ctx
  await HANDLERS.revive!(context, { type: "revive" })
  expect(save).not.toHaveBeenCalled()
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: -1, result: { ok: false, reason: "NOT_READY" } })
})

it("does not save or broadcast movement when standing is refused", async () => {
  const send = vi.fn(async () => {}),
    broadcast = vi.fn(async () => {}),
    save = vi.fn()
  const me = { owner: "owner", player: mapPlayer("connection", player({ sitting: true }), [10, 10]), route: [[10, 10]], since: Date.now(), sitting: true }
  const context = { ctx: { connection: { id: "connection", send }, room: { broadcast } }, map: {}, me, save, standUp: async () => false } as unknown as Ctx
  await HANDLERS.move!(context, {
    type: "move",
    path: [
      [10, 10],
      [11, 10],
    ],
  })
  expect(walk).not.toHaveBeenCalled()
  expect(save).not.toHaveBeenCalled()
  expect(broadcast).not.toHaveBeenCalled()
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "move", at: [10, 10] })
})
