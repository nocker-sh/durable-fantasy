import { afterEach, expect, it, vi } from "vitest"
import { GameSession } from "#/world/client/game-session"
import { PlayerActions } from "#/world/client/player-actions"
import { ServerMessages } from "#/world/client/server-messages"
import { sendFightSwing } from "#/world/client/send-fight-swing"
import { getAttackReadiness } from "#/world/core/get-attack-readiness"
import { apply } from "#/world/core/apply"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { player } from "#/world/test/player"
import type { VoidSocket } from "void/ws"

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

it("delivers one keypress on a later swing when network jitter made its first attempt too early", () => {
  vi.useFakeTimers()
  vi.setSystemTime(10000)
  const clock = vi.spyOn(performance, "now").mockReturnValue(1000)
  const session = new GameSession()
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  const hunter = player({ equipment: { ...emptyEquipment(), weapon: "oak-staff" }, stats: { ...player().stats, mnd: 7, int: 9 } })
  session.state.set((s) => ({ ...s, player: hunter }))
  session.fighting = { monster: "first", at: 1000 }
  const actions = new PlayerActions({ session, notify: vi.fn(), run: vi.fn(), lookAtShop: vi.fn(), getScene: () => null, update: vi.fn(), toggleWindow: vi.fn() })
  actions.useSkill("ember")
  vi.setSystemTime(11500)
  clock.mockReturnValue(2500)
  sendFightSwing(session, "first")
  expect(send).toHaveBeenLastCalledWith({ type: "attack", monster: "first", art: "ember" })
  // The previous normal attack reached the server 300ms late. Keep the authoritative interval.
  expect(getAttackReadiness({ player: hunter, struck: 10300, art: "ember", now: Date.now() })).toEqual({ kind: "ignore" })
  expect(session.art?.skill).toBe("ember")
  vi.setSystemTime(13160)
  clock.mockReturnValue(4160)
  sendFightSwing(session, "first")
  expect(getAttackReadiness({ player: hunter, struck: 10300, art: "ember", now: Date.now() }).kind).toBe("ready")
  const paid = apply(hunter, { type: "art", skill: "ember" }, { now: Date.now() })
  if (!paid.ok) throw Error(paid.reason)
  const messages = new ServerMessages({
    session,
    getScene: () => null,
    report: vi.fn(),
    addChat: vi.fn(),
    avatarOf: vi.fn(),
    connect: vi.fn(),
    enterMap: vi.fn(),
    maybeReady: vi.fn(),
    notify: vi.fn(),
    standBy: vi.fn(),
    toggleWindow: vi.fn(),
    update: vi.fn(),
    visitTown: vi.fn(),
    wayBeside: vi.fn(),
    setPlayer: (state) => session.state.set((s) => ({ ...s, player: state })),
  })
  messages.handle({ type: "result", seq: -1, result: paid })
  expect(session.art).toBeNull()
  expect(session.state.get().player!.sp).toBeLessThan(hunter.sp)
  const saved = structuredClone(session.state.get().player)
  clock.mockReturnValue(5820)
  sendFightSwing(session, "first")
  expect(send.mock.calls.map((call) => call[0].art)).toEqual(["ember", "ember", undefined])
  expect(session.state.get().player).toEqual(saved)
})

it.each(["another-target", "expired", "cooldown"])("does not carry a queued art into %s", (reason) => {
  vi.useFakeTimers()
  vi.setSystemTime(10000)
  vi.spyOn(performance, "now").mockReturnValue(reason === "expired" ? 5001 : 2000)
  const session = new GameSession()
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  session.art = { skill: "ember", monster: "first", at: 1000 }
  session.state.set((s) => ({ ...s, player: player({ ready: reason === "cooldown" ? { ember: 11000 } : {} }) }))
  sendFightSwing(session, reason === "another-target" ? "second" : "first")
  expect(send.mock.calls[0][0].art).toBeUndefined()
  expect(session.art).toBeNull()
})

it("carries a queued art whose wait the server has finished, though this device's clock is a minute slow", () => {
  vi.useFakeTimers()
  // the wait ended at 70000 by the server's clock; this device reads 60 s less than the server
  vi.setSystemTime(15000)
  vi.spyOn(performance, "now").mockReturnValue(2000)
  const session = new GameSession()
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  session.art = { skill: "ember", monster: "first", at: 1000 }
  session.state.set((s) => ({ ...s, clockOffset: 60_000, player: player({ ready: { ember: 70000 } }) }))
  sendFightSwing(session, "first")
  expect(send).toHaveBeenLastCalledWith({ type: "attack", monster: "first", art: "ember" })
  expect(session.art?.skill).toBe("ember")
})

it("clears a definitively refused art without stopping normal attacks or clearing another target's reservation", () => {
  const session = new GameSession()
  session.fighting = { monster: "first", at: 1000 }
  session.art = { skill: "ember", monster: "first", at: 1000 }
  const messages = new ServerMessages({ session, getScene: () => null, notify: vi.fn() } as unknown as ConstructorParameters<typeof ServerMessages>[0])
  messages.handle({ type: "refused", what: "art", monster: "previous", reason: "SP_SHORT" })
  expect(session.art).not.toBeNull()
  messages.handle({ type: "refused", what: "art", monster: "first", reason: "SP_SHORT" })
  expect(session.art).toBeNull()
  expect(session.fighting?.monster).toBe("first")
})
