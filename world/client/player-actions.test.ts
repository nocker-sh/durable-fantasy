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
