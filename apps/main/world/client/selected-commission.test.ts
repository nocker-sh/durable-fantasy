import { afterEach, beforeEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { GameSession } from "#/world/client/game-session"
import { PlayerActions } from "#/world/client/player-actions"
import { RoomClient } from "#/world/client/room-client"
import { apply } from "#/world/core/apply"
import { addItem } from "#/world/core/add-item"
import { emptyBag } from "#/world/core/empty-bag"
import { COMMISSIONS } from "#/world/core/commissions"
import type { Commission, Order } from "#/world/core/commission-types"
import { REASON_TEXT } from "#/world/core/commands"
import type { Command, ServerCommand } from "#/world/core/commands"
import { playerStateSchema } from "#/world/core/player-schema"
import { player } from "#/world/test/player"

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

function fixture(job: Commission) {
  const other = COMMISSIONS.find((entry) => entry.craftsman === job.craftsman && entry.id !== job.id) ?? job
  let bag = emptyBag()
  for (const ordered of [job, other, job])
    for (const input of ordered.inputs) {
      const next = addItem({ bag, item: input.item, count: input.count })
      expect(next).not.toBeNull()
      bag = next!
    }
  const initial = player()
  // Only supplies and carrying strength are local. Both orders are placed with the native command.
  let server = player({ bag, gold: 10000, stats: { ...initial.stats, str: 40 }, hpAt: Date.now(), spAt: Date.now() })
  const commit = (command: Command | ServerCommand) => {
    const result = apply(server, command, { now: Date.now() })
    expect(result.ok).toBe(true)
    if (!result.ok) throw Error(result.reason)
    server = result.state
    playerStateSchema.parse(server)
    return result
  }
  commit({ type: "order", commission: job.id, roll: 0 })
  commit({ type: "order", commission: other.id, roll: 0.99 })
  vi.setSystemTime(Math.max(...server.orders.map((order) => order.readyAt)))
  const shown = structuredClone(server.orders)
  const session = new GameSession()
  session.others.welcome("player", [])
  session.state.set((state) => ({ ...state, player: structuredClone(server), online: "online" }))
  const sent: { type: "collect"; seq: number; index: number; orders: Order[] }[] = []
  session.socket = { send: (message: (typeof sent)[number]) => sent.push(structuredClone(message)) } as unknown as VoidSocket<"/map/:mapId">
  const notify = vi.fn()
  const report = vi.fn()
  const update: ConstructorParameters<typeof RoomClient>[0]["update"] = (patch) => session.state.set((state) => ({ ...state, ...(typeof patch === "function" ? patch(state) : patch) }))
  const client = new RoomClient({
    session,
    update,
    notify,
    report,
    getScene: () => null,
    onServer: () => {
      throw Error("Only pending command results should be delivered")
    },
    preview: (command) => {
      const result = apply(session.state.get().player!, command, { now: Date.now() })
      return result.ok ? null : result.reason
    },
    setPlayer: (state) => update({ player: state }),
  })
  const actions = new PlayerActions({ session, update, notify, run: client.run.bind(client), lookAtShop() {}, getScene: () => null, toggleWindow: () => {} })
  const change = (kind: "shift" | "append" | "empty", publish: boolean) => {
    if (kind === "append") commit({ type: "order", commission: job.id, roll: 0.5 })
    else {
      commit({ type: "collect", index: 0, expectedOrders: server.orders })
      if (kind === "empty") commit({ type: "collect", index: 0, expectedOrders: server.orders })
    }
    if (publish) update({ player: structuredClone(server) })
  }
  const unrelated = () => {
    const slot = server.bag.findIndex((stack) => stack !== null)
    expect(slot).toBeGreaterThanOrEqual(0)
    commit({ type: "discard", slot, count: 1, expectedStack: server.bag[slot]! })
    update({ player: structuredClone(server) })
    expect(server.orders).toEqual(shown)
  }
  const deliver = async (expectedOrders = shown) => {
    const message = sent.at(-1)!
    expect(message).toEqual({ type: "collect", seq: expect.any(Number), index: 0, orders: expectedOrders })
    const result = apply(server, { type: "collect", index: message.index, expectedOrders: message.orders }, { now: Date.now() })
    if (result.ok) server = result.state
    session.waiting.get(message.seq)!(result)
    await Promise.resolve()
    await Promise.resolve()
    expect(session.waiting.size).toBe(0)
    expect(session.state.get().busy).toBe(false)
    return result
  }
  return { actions, session, change, unrelated, deliver, shown, sent, notify, report, read: () => structuredClone(server) }
}

for (const change of ["shift", "append", "empty"] as const)
  it.each(COMMISSIONS)(`$id: a rendered queue changed by ${change} cannot collect a different order before dispatch`, async (job) => {
    const live = fixture(job)
    live.change(change, true)
    const before = live.read()
    const displayed = structuredClone(live.session.state.get().player)
    live.actions.collect(0, live.shown)
    if (live.sent.length) await live.deliver(live.session.state.get().player!.orders)
    await Promise.resolve()
    expect(live.read()).toEqual(before)
    expect(live.sent).toEqual([])
    expect(live.notify).toHaveBeenCalledExactlyOnceWith(REASON_TEXT.ORDER_CHANGED, "bad")
    expect(live.session.state.get().player).toEqual(displayed)
    expect(live.session.state.get().busy).toBe(false)
    expect(live.report).not.toHaveBeenCalled()
  })

for (const change of ["shift", "append", "empty"] as const)
  it.each(COMMISSIONS)(`$id: native collection rejects the original queue after ${change} while in flight`, async (job) => {
    const live = fixture(job)
    live.actions.collect(0, live.shown)
    expect(live.session.state.get().busy).toBe(true)
    live.change(change, false)
    const before = live.read()
    expect(await live.deliver()).toEqual({ ok: false, reason: "ORDER_CHANGED" })
    expect(live.read()).toEqual(before)
    expect(live.notify).toHaveBeenCalledExactlyOnceWith(REASON_TEXT.ORDER_CHANGED, "bad")
    expect(live.report).not.toHaveBeenCalled()
  })

it.each(COMMISSIONS)("$id: the same rendered order collects once and a second stale press preserves the complete result", async (job) => {
  const live = fixture(job)
  live.unrelated()
  const before = live.read()
  const expected = apply(before, { type: "collect", index: 0, expectedOrders: live.shown }, { now: Date.now() })
  expect(expected.ok).toBe(true)
  live.actions.collect(0, live.shown)
  await Promise.resolve()
  // A second press while waiting is stopped by the actual client controller.
  live.actions.collect(0, live.shown)
  expect(live.sent).toHaveLength(1)
  expect(await live.deliver()).toEqual(expected)
  if (!expected.ok) throw Error(expected.reason)
  expect(live.read()).toEqual(expected.state)
  expect(live.session.state.get().player).toEqual(expected.state)
  expect(live.report.mock.calls).toEqual(expected.events.map((event) => [event]))
  const completed = live.read()
  live.actions.collect(0, live.shown)
  expect(live.sent).toHaveLength(1)
  expect(live.read()).toEqual(completed)
  expect(live.notify).toHaveBeenCalledExactlyOnceWith(REASON_TEXT.ORDER_CHANGED, "bad")
})
