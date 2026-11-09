import { afterEach, beforeEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { GameSession } from "#/world/client/game-session"
import { PlayerActions } from "#/world/client/player-actions"
import { RoomClient } from "#/world/client/room-client"
import { apply } from "#/world/core/apply"
import type { Stack } from "#/world/core/bag-types"
import { REASON_TEXT } from "#/world/core/commands"
import type { Command, ServerCommand } from "#/world/core/commands"
import { emptyBag } from "#/world/core/empty-bag"
import { lifeThresholds } from "#/world/core/life-thresholds"
import { ITEMS } from "#/world/core/items/catalog"
import { playerStateSchema } from "#/world/core/player-schema"
import { player } from "#/world/test/player"

type Action = "store" | "retrieve" | "use" | "sell"
type Case = { name: string; action: Action; stack: Stack }
const tool: Stack = { item: "wood-axe", count: 1, q: 1, by: "アルノルト", dur: 5 }
const cases: Case[] = [
  { name: "deposit tool", action: "store", stack: tool },
  { name: "withdraw tool", action: "retrieve", stack: tool },
  { name: "equip tool", action: "use", stack: tool },
  { name: "sell tool", action: "sell", stack: tool },
  { name: "consume medicine", action: "use", stack: { item: "potion", count: 2 } },
  { name: "deposit materials", action: "store", stack: { item: "herb", count: 5 } },
  { name: "withdraw materials", action: "retrieve", stack: { item: "herb", count: 5 } },
]

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

function fixture(test: Case) {
  const session = new GameSession()
  const base = player()
  let server = player({
    bag: test.action === "retrieve" ? emptyBag() : [test.stack, ...emptyBag().slice(1)],
    storage: test.action === "retrieve" ? [test.stack, ...base.storage.slice(1)] : base.storage,
    gold: 1000,
    stats: { ...base.stats, str: 8 },
    life: { ...base.life, woodcutting: lifeThresholds[4] },
    hpAt: Date.now(),
    spAt: Date.now(),
    fullAt: Date.now(),
  })
  playerStateSchema.parse(server)
  session.others.welcome("player", [])
  session.state.set((state) => ({ ...state, player: structuredClone(server), shop: "buyer", online: "online" }))
  type Outgoing = { type: "command"; seq: number; command: Command } | { type: "storage"; seq: number; action: "store" | "retrieve"; index: number; count: number; stack: Stack }
  const sent: Outgoing[] = []
  session.socket = { send: (message: Outgoing) => sent.push(structuredClone(message)) } as unknown as VoidSocket<"/map/:mapId">
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
      throw new Error("Socket reception is delivered through the native pending request")
    },
    preview: (command) => {
      const result = apply(session.state.get().player!, command, { now: Date.now() })
      return result.ok ? null : result.reason
    },
    setPlayer: (state) => update({ player: state }),
  })
  const actions = new PlayerActions({ session, update, notify, run: client.run.bind(client), lookAtShop: () => {}, getScene: () => null, toggleWindow: () => {} })
  const command: Command | ServerCommand =
    test.action === "store"
      ? { type: "store", slot: 0, count: 1, expectedStack: test.stack }
      : test.action === "retrieve"
        ? { type: "retrieve", index: 0, count: 1, expectedStack: test.stack }
        : test.action === "sell"
          ? { type: "sell", shop: "buyer", slot: 0, count: 1, expectedStack: test.stack }
          : { type: ITEMS[test.stack.item].equip ? "equip" : "use", slot: 0, expectedStack: test.stack }
  const act = () => {
    if (test.action === "use") actions.useSlot(0, test.stack)
    else if (test.action === "sell") actions.sell({ slot: 0, count: 1, expectedStack: test.stack })
    else actions[test.action](0, 1, test.stack)
  }
  const replace = (stack: Stack | null, publish: boolean) => {
    server = test.action === "retrieve" ? { ...server, storage: [stack, ...server.storage.slice(1)] } : { ...server, bag: [stack, ...server.bag.slice(1)] }
    playerStateSchema.parse(server)
    if (publish) update({ player: structuredClone(server) })
  }
  const unrelated = () => {
    server = { ...server, gold: server.gold + 1, bag: [...server.bag.slice(0, 1), { item: "log", count: 1 }, ...server.bag.slice(2)] }
    playerStateSchema.parse(server)
    update({ player: structuredClone(server) })
  }
  const deliver = async () => {
    expect(sent).toHaveLength(1)
    const message = sent[0]
    const request: Command | ServerCommand =
      message.type === "command"
        ? message.command
        : message.action === "store"
          ? { type: "store", slot: message.index, count: message.count, expectedStack: message.stack }
          : { type: "retrieve", index: message.index, count: message.count, expectedStack: message.stack }
    expect(request).toEqual(command)
    const result = apply(server, request, { now: Date.now() })
    if (result.ok) server = result.state
    session.waiting.get(message.seq)!(result)
    await Promise.resolve()
    await Promise.resolve()
    expect(session.state.get().busy).toBe(false)
    expect(session.waiting.size).toBe(0)
    return result
  }
  return { session, act, replace, deliver, sent, notify, report, command, read: () => structuredClone(server), unrelated }
}

for (const test of cases) {
  const changes: { name: string; stack: Stack | null }[] = [
    { name: "item", stack: { item: test.stack.item === "herb" ? "log" : "herb", count: 1 } },
    { name: "empty", stack: null },
  ]
  if (test.stack.count > 1) changes.push({ name: "quantity", stack: { ...test.stack, count: test.stack.count - 1 } })
  if (test.stack.q !== undefined) changes.push({ name: "quality", stack: { ...test.stack, q: 2 } }, { name: "maker", stack: { ...test.stack, by: "エルザ" } })
  if (test.stack.dur !== undefined) changes.push({ name: "durability", stack: { ...test.stack, dur: test.stack.dur - 1 } })

  it.each(changes)(`${test.name}: rejects a rendered selection after $name changes before dispatch`, async (change) => {
    const live = fixture(test)
    live.replace(change.stack, true)
    const before = live.read()
    const displayed = structuredClone(live.session.state.get().player)
    live.act()
    await Promise.resolve()
    expect(live.sent).toEqual([])
    expect(live.notify).toHaveBeenCalledExactlyOnceWith(REASON_TEXT.ITEM_CHANGED, "bad")
    expect(live.read()).toEqual(before)
    expect(live.session.state.get().player).toEqual(displayed)
    expect(live.session.state.get().busy).toBe(false)
    expect(live.report).not.toHaveBeenCalled()
  })

  it.each(changes)(`${test.name}: preserves the selected stack until authoritative rejection after $name changes in flight`, async (change) => {
    const live = fixture(test)
    live.act()
    expect(live.session.state.get().busy).toBe(true)
    live.replace(change.stack, false)
    const before = live.read()
    expect(await live.deliver()).toEqual({ ok: false, reason: "ITEM_CHANGED" })
    expect(live.read()).toEqual(before)
    expect(live.notify).toHaveBeenCalledExactlyOnceWith(REASON_TEXT.ITEM_CHANGED, "bad")
    expect(live.report).not.toHaveBeenCalled()
  })

  it(`${test.name}: accepts the same rendered stack after unrelated updates through native preview, dispatch and result publication`, async () => {
    const live = fixture(test)
    live.unrelated()
    const before = live.read()
    const expected = apply(before, live.command, { now: Date.now() })
    expect(expected.ok).toBe(true)
    live.act()
    expect(await live.deliver()).toEqual(expected)
    if (!expected.ok) throw new Error("The native control command must succeed")
    expect(live.read()).toEqual(expected.state)
    expect(live.session.state.get().player).toEqual(expected.state)
    expect(live.report.mock.calls).toEqual(expected.events.map((event) => [event]))
    expect(live.notify).not.toHaveBeenCalled()
  })
}
