import { afterEach, expect, it, vi } from "vitest"
import { PlayerActions } from "./player-actions"
import { GameSession } from "./session"
import { emptyEquipment } from "../core/player"
import { player } from "../test/helpers"
import { REASON_TEXT } from "../core/commands"
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
