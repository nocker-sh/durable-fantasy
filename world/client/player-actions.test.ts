import { afterEach, expect, it, vi } from "vitest"
import { PlayerActions } from "#/world/client/player-actions"
import { GameSession } from "#/world/client/game-session"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { player } from "#/world/test/player"
import { NODES } from "#/world/core/gather"
import { REASON_TEXT } from "#/world/core/commands"
import type { VoidSocket } from "void/ws"

afterEach(() => vi.useRealTimers())

it("does not send a repeated art during its cooldown and accepts it at the deadline", () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const session = new GameSession()
  const send = vi.fn()
  const notify = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  session.fighting = { monster: "test-monster", at: performance.now() }
  session.state.set((s) => ({
    ...s,
    player: player({
      equipment: { ...emptyEquipment(), weapon: "dagger" },
      stats: { ...player().stats, dex: 9 },
      ready: { pierce: 2000 },
    }),
  }))
  const actions = new PlayerActions({ session, notify, run: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  actions.useSkill("pierce")
  expect(send).not.toHaveBeenCalled()
  expect(notify).toHaveBeenCalledWith(REASON_TEXT.COOLDOWN, "bad")
  vi.setSystemTime(2000)
  actions.useSkill("pierce")
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "attack", monster: "test-monster", art: "pierce" })
})

it.each([true, false])("returns the authoritative gathering outcome %s after the reply", async (accepted) => {
  const session = new GameSession()
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  let reply!: (ok: boolean) => void
  const run = vi.fn((_command, dispatch) => {
    dispatch(7)
    return new Promise<boolean>((resolve) => {
      reply = resolve
    })
  })
  const actions = new PlayerActions({ session, run, notify: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  const done = vi.fn()
  const pending = actions.gather("south-meadow-herbs-1").then(done)
  await Promise.resolve()
  expect(done).not.toHaveBeenCalled()
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "gather", seq: 7, node: "south-meadow-herbs-1" })
  reply(accepted)
  await pending
  expect(done).toHaveBeenCalledExactlyOnceWith(accepted)
})

it.each(["busy", "engaged", "unknown"])("reports a skipped gathering request when %s without sending it", async (reason) => {
  const session = new GameSession()
  if (reason === "busy") session.state.set((s) => ({ ...s, busy: true }))
  if (reason === "engaged") session.engaged = "resident"
  const run = vi.fn()
  const actions = new PlayerActions({ session, run, notify: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  expect(await actions.gather(reason === "unknown" ? "missing-node" : "south-meadow-herbs-1")).toBe(false)
  expect(run).not.toHaveBeenCalled()
})

it("rejects an art with insufficient SP locally and sends it after regeneration without spending locally", () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const session = new GameSession()
  const send = vi.fn()
  const notify = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  session.fighting = { monster: "test-monster", at: performance.now() }
  const p = player({
    equipment: { ...emptyEquipment(), weapon: "dagger" },
    stats: { ...player().stats, dex: 9 },
    sp: 2,
    spAt: 1000,
    hpAt: 1000,
  })
  const before = structuredClone(p)
  session.state.set((s) => ({ ...s, player: p }))
  const actions = new PlayerActions({ session, notify, run: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  actions.useSkill("pierce")
  expect(send).not.toHaveBeenCalled()
  expect(notify).toHaveBeenCalledWith(REASON_TEXT.SP_SHORT, "bad")
  vi.setSystemTime(61000)
  session.fighting.at = performance.now()
  actions.useSkill("pierce")
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "attack", monster: "test-monster", art: "pierce" })
  expect(session.state.get().player).toEqual(before)
})

it.each([
  ["tree", "斧"],
  ["fish", "釣り竿"],
] as const)("explains the missing tool for %s before animation or sending", async (kind, name) => {
  const session = new GameSession()
  session.state.set((s) => ({ ...s, player: player() }))
  const run = vi.fn()
  const notify = vi.fn()
  const getScene = vi.fn(() => null)
  const actions = new PlayerActions({ session, run, notify, getScene, lookAtShop: vi.fn(), update: vi.fn() })
  expect(await actions.gather(NODES.find((node) => node.kind === kind)!.id)).toBe(false)
  expect(run).not.toHaveBeenCalled()
  expect(getScene).not.toHaveBeenCalled()
  expect(notify).toHaveBeenCalledWith(expect.stringContaining(`${name}が必要`), "bad")
})

it("accepts an equipped usable axe without requiring another in the bag", async () => {
  const session = new GameSession()
  session.state.set((s) => ({ ...s, player: player({ equipment: { ...emptyEquipment(), weapon: "wood-axe" }, worn: { weapon: { q: 1, dur: 1 } } }) }))
  const run = vi.fn(async () => true)
  const notify = vi.fn()
  const actions = new PlayerActions({ session, run, notify, getScene: () => null, lookAtShop: vi.fn(), update: vi.fn() })
  expect(await actions.gather(NODES.find((node) => node.kind === "tree")!.id)).toBe(true)
  expect(run).toHaveBeenCalledTimes(1)
  expect(notify).not.toHaveBeenCalled()
})
it("captures the displayed commission queue before dispatch", () => {
  const session = new GameSession(),
    send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  const orders = [{ commission: "gunter-sword", readyAt: 1000, q: 1 as const }]
  session.state.set((s) => ({ ...s, player: player({ orders }) }))
  let dispatch!: (seq: number) => void
  const run = vi.fn(async (_command, callback) => {
    dispatch = callback
    return true
  })
  const actions = new PlayerActions({ session, run, notify: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  actions.collect(0)
  session.state.set((s) => ({ ...s, player: player({ orders: [] }) }))
  dispatch(7)
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "collect", seq: 7, index: 0, orders })
  actions.collect(0)
  expect(run).toHaveBeenCalledTimes(1)
})
it.each(["store", "retrieve"] as const)("captures the selected %s stack before dispatch", (action) => {
  const session = new GameSession(),
    send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  const stack = { item: "herb" as const, count: 5 }
  session.state.set((s) => ({ ...s, player: player({ bag: [stack], storage: [stack] }) }))
  let dispatch!: (seq: number) => void
  const run = vi.fn(async (_command, callback) => {
    dispatch = callback
    return true
  })
  const actions = new PlayerActions({ session, run, notify: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  actions[action](0, 1)
  session.state.set((s) => ({ ...s, player: player({ bag: [null], storage: [null] }) }))
  dispatch(7)
  expect(send).toHaveBeenCalledExactlyOnceWith({ type: "storage", seq: 7, action, index: 0, count: 1, stack })
  actions[action](0, 1)
  expect(run).toHaveBeenCalledTimes(1)
})
it("does not replace a dragged warehouse deposit with the current slot contents", () => {
  const session = new GameSession(),
    run = vi.fn(),
    notify = vi.fn()
  const grabbed = { item: "herb" as const, count: 5 }
  session.state.set((s) => ({ ...s, player: player({ bag: [{ item: "log", count: 5 }] }) }))
  const actions = new PlayerActions({ session, run, notify, lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  actions.store(0, 5, grabbed)
  expect(run).not.toHaveBeenCalled()
  expect(notify).toHaveBeenCalledWith(REASON_TEXT.ITEM_CHANGED, "bad")
})
it("sends both the grabbed item and the current destination for a bag drop", () => {
  const session = new GameSession(),
    run = vi.fn()
  const grabbed = { item: "herb" as const, count: 5 },
    destination = { item: "log" as const, count: 2 }
  session.state.set((s) => ({ ...s, player: player({ bag: [grabbed, destination] }) }))
  const actions = new PlayerActions({ session, run, notify: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  actions.moveSlot(0, 1, grabbed)
  expect(run).toHaveBeenCalledExactlyOnceWith({ type: "move", from: 0, to: 1, expectedStack: grabbed, expectedTarget: destination })
})
it.each(["potion", "dagger"] as const)("keeps the selected %s for double-click use or equipment", (item) => {
  const session = new GameSession(),
    run = vi.fn(),
    stack = { item, count: 1 }
  session.state.set((s) => ({ ...s, player: player({ bag: [stack] }) }))
  const actions = new PlayerActions({ session, run, notify: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  actions.useSlot(0)
  expect(run).toHaveBeenCalledExactlyOnceWith({ type: item === "dagger" ? "equip" : "use", slot: 0, expectedStack: stack })
})
it("captures the exact worn item on double-click removal", () => {
  const session = new GameSession(),
    run = vi.fn(),
    before = player()
  const mark = { q: 2 as const, by: "ギュンター", dur: 3 }
  session.state.set((s) => ({ ...s, player: player({ equipment: { ...before.equipment, weapon: "wood-axe" }, worn: { weapon: mark } }) }))
  const actions = new PlayerActions({ session, run, notify: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn() })
  actions.unequip("weapon")
  expect(run).toHaveBeenCalledExactlyOnceWith({ type: "unequip", slot: "weapon", expectedStack: { item: "wood-axe", count: 1, ...mark } })
})
