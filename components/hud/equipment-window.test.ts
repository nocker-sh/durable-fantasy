import { createElement, type ComponentProps, type MouseEvent } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { GameProvider } from "#/components/game/game-provider"
import { Slot as ItemSlot } from "#/components/game/slot"
import { EquipmentWindow } from "#/components/hud/equipment-window"
import { Game } from "#/world/game"
import type { GameSession } from "#/world/client/game-session"
import { apply } from "#/world/core/apply"
import type { Stack } from "#/world/core/bag-types"
import { REASON_TEXT } from "#/world/core/commands"
import type { Command } from "#/world/core/commands"
import { carried } from "#/world/core/inventory-weight"
import { derive } from "#/world/core/derive"
import { displayName } from "#/world/core/display-name"
import { emptyBag } from "#/world/core/empty-bag"
import { MAX_LEVEL, MAX_STAT } from "#/world/core/growth-rules"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { SLOT_NAME } from "#/world/core/items/kinds"
import type { Slot } from "#/world/core/items/kinds"
import { slotsFor } from "#/world/core/items/slots-for"
import { lifeThresholds } from "#/world/core/life-thresholds"
import { playerStateSchema } from "#/world/core/player-schema"
import type { PlayerState } from "#/world/core/player-types"
import { player } from "#/world/test/player"

const drawn = vi.hoisted(() => new Map<string, () => void>())
// Observe the actual rendered callback while retaining the native slot and game hooks.
vi.mock("#/components/game/slot", async (original) => {
  const actual = await original<typeof import("#/components/game/slot")>()
  return {
    ...actual,
    Slot: (props: ComponentProps<typeof ItemSlot>) => {
      if (props["aria-label"] && props.onDoubleClick) drawn.set(props["aria-label"], () => props.onDoubleClick!({} as MouseEvent<HTMLButtonElement>))
      return createElement(actual.Slot, props)
    },
  }
})
vi.mock("#/world/art/icons/to-url", () => ({ toUrl: () => "data:image/png;base64," }))
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  drawn.clear()
})

const cases = (Object.keys(ITEMS) as ItemId[]).flatMap((item) => slotsFor(item).map((slot) => ({ item, slot })))

function fixture(item: ItemId, slot: Slot) {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const shown: Stack = { item, count: 1, q: 1, by: "ギュンター", ...(ITEMS[item].kind === "tool" ? { dur: 5 } : {}) }
  const base = player()
  const initial = player({
    profileComplete: true,
    level: MAX_LEVEL,
    stats: { vit: MAX_STAT, mnd: MAX_STAT, str: MAX_STAT, dex: MAX_STAT, int: MAX_STAT, fth: MAX_STAT },
    life: Object.fromEntries(Object.keys(base.life).map((key) => [key, lifeThresholds.at(-1)!])) as PlayerState["life"],
    bag: [shown, { ...shown, q: 2 }, { ...shown, by: "エルザ" }, { item: "log", count: 2 }, ...emptyBag().slice(4)],
    hpAt: Date.now(),
    spAt: Date.now(),
    fullAt: Date.now(),
  })
  let server = initial
  const commit = (command: Command) => {
    const result = apply(server, command, { now: Date.now() })
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.reason)
    server = result.state
    playerStateSchema.parse(server)
    return result
  }
  commit({ type: "equip", slot: 0, to: slot, expectedStack: shown })
  const game = new Game()
  const session = (game as unknown as { session: GameSession }).session
  session.others.welcome("connection", [])
  const publish = () => game.state.set((state) => ({ ...state, player: structuredClone(server), derived: { ...derive(server), weight: carried(server) }, online: "online", windows: ["equipment"] }))
  publish()
  const sent: { type: "command"; seq: number; command: Command }[] = []
  session.socket = { send: (message: (typeof sent)[number]) => sent.push(structuredClone(message)) } as unknown as VoidSocket<"/map/:mapId">
  const render = () => {
    drawn.clear()
    renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(EquipmentWindow) }))
    const callback = drawn.get(`${SLOT_NAME[slot]}: ${displayName(item, game.state.get().player!.worn[slot]?.by)}`)
    if (!callback) throw new Error("The actual equipment slot has no double-click callback")
    return callback
  }
  const deliver = async () => {
    const message = sent.at(-1)!
    const result = apply(server, message.command, { now: Date.now() })
    if (result.ok) server = result.state
    session.waiting.get(message.seq)!(result)
    await Promise.resolve()
    await Promise.resolve()
    expect(session.waiting.size).toBe(0)
    expect(game.state.get().busy).toBe(false)
    return result
  }
  return { game, shown, commit, publish, render, deliver, sent, read: () => structuredClone(server) }
}

for (const change of ["quality", "maker"] as const)
  it.each(cases)(`$item/$slot: a double-click drawn before a native ${change} swap cannot remove the replacement`, async (entry) => {
    const f = fixture(entry.item, entry.slot)
    const click = f.render()
    f.commit({ type: "equip", slot: change === "quality" ? 1 : 2, to: entry.slot })
    f.publish()
    const before = f.read()
    click()
    // If the stale UI dispatches, deliver that actual request to expose the wrong removal too.
    if (f.sent.length) await f.deliver()
    expect(f.read()).toEqual(before)
    expect(f.sent).toEqual([])
    expect(f.game.state.get().player).toEqual(before)
    expect(f.game.state.get().notices.at(-1)?.text).toBe(REASON_TEXT.ITEM_CHANGED)
    const fresh = f.render()
    fresh()
    expect(f.sent).toHaveLength(1)
    expect((await f.deliver()).ok).toBe(true)
    expect(f.read().equipment[entry.slot]).toBeNull()
  })

it.each(cases)("$item/$slot: a native swap in flight rejects the originally displayed equipment", async (entry) => {
  const f = fixture(entry.item, entry.slot)
  const click = f.render()
  click()
  click()
  expect(f.sent).toHaveLength(1)
  expect(f.sent[0].command).toEqual({ type: "unequip", slot: entry.slot, expectedStack: f.shown })
  f.commit({ type: "equip", slot: 1, to: entry.slot })
  const before = f.read()
  expect(await f.deliver()).toEqual({ ok: false, reason: "ITEM_CHANGED" })
  expect(f.read()).toEqual(before)
  expect(f.game.state.get().notices.at(-1)?.text).toBe(REASON_TEXT.ITEM_CHANGED)
})

it.each(cases)("$item/$slot: unrelated native inventory changes retain the displayed equipment operation", async (entry) => {
  const f = fixture(entry.item, entry.slot)
  const click = f.render()
  f.commit({ type: "discard", slot: 3, count: 1 })
  f.publish()
  const expected = apply(f.read(), { type: "unequip", slot: entry.slot, expectedStack: f.shown }, { now: Date.now() })
  expect(expected.ok).toBe(true)
  click()
  click()
  expect(f.sent).toHaveLength(1)
  expect(await f.deliver()).toEqual(expected)
  if (!expected.ok) throw new Error(expected.reason)
  expect(f.read()).toEqual(expected.state)
  expect(f.game.state.get().player).toEqual(expected.state)
  click()
  expect(f.sent).toHaveLength(1)
  expect(f.read()).toEqual(expected.state)
})
