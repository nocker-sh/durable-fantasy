import { afterEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { DialogueActions } from "#/world/client/dialogue"
import { GameSession } from "#/world/client/game-session"
import { RoomClient } from "#/world/client/room-client"
import { ServerMessages } from "#/world/client/server-messages"
import { createSessionContext } from "#/world/client/create-session-context"
import { remoteAvatar } from "#/world/client/remote-avatar"
import { ERRANDS } from "#/world/core/errands"
import { apply } from "#/world/core/apply"
import { parsePlayer } from "#/world/core/parse-player"
import { fullyShown } from "#/world/fully-shown"
import { RESIDENTS } from "#/world/town/residents"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { errandAskTime } from "#/world/test/errand-ask-time"
import type { Errand } from "#/world/core/errand-types"
import type { GameState } from "#/world/state"

// a day each errand is drawn, at a quarter hour its asker asks it
const days = new Map(ERRANDS.map((errand) => [errand.id, errandAskTime(errand)] as const))

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function fixture(errand: Errand, stage: "take" | "hand") {
  vi.useFakeTimers()
  const now = days.get(errand.id)!
  vi.setSystemTime(now)
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => {} })
  // Materials, the daily clock and meeting a resident are local conditions.
  // The handover setup earns its taken record through the real command first.
  const fresh = player(errand.kind === "bring" ? { bag: bagWith([errand.wants.item, errand.wants.count]) } : {})
  const take = { type: "errand-take", errand: errand.id, from: errand.from } as const
  const taken = apply(fresh, take, { now })
  if (!taken.ok) throw new Error(`${errand.id}: failed to take its actual offer`)
  const initial = stage === "take" ? fresh : taken.state
  const resident = stage === "take" ? errand.from : errand.kind === "bring" ? errand.from : errand.to
  const residentId = RESIDENTS.findIndex((entry) => entry.name === resident)
  expect(residentId).toBeGreaterThanOrEqual(0)
  const command = stage === "take" ? take : ({ type: "errand-hand", errand: errand.id, to: resident } as const)
  const result = apply(initial, command, { now })
  if (!result.ok) throw new Error(`${errand.id}: native ${stage} failed`)
  const duplicate = apply(result.state, command, { now })
  expect(duplicate.ok).toBe(false)
  const saved = JSON.parse(JSON.stringify(result.state))
  const restored = parsePlayer(saved)
  expect(restored).toEqual(result.state)
  if (!restored) throw new Error("Native errand result did not reload")
  const session = new GameSession()
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  session.others.welcome("local-connection", [])
  session.state.set((state) => ({ ...state, online: "online", player: initial }))
  const update = (patch: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => session.state.set((state) => ({ ...state, ...(typeof patch === "function" ? patch(state) : patch) }))
  let room: RoomClient
  const pending: Array<Promise<boolean>> = []
  const context = createSessionContext(session, {
    getScene: () => null,
    preview: () => {
      throw new Error("Custom errand transport must not preview an unrelated use command")
    },
    onServer: () => {},
    wayBeside: () => null,
    standBy: () => {},
    avatarOf: remoteAvatar,
    setPlayer: (player) => update({ player }),
    maybeReady: () => {},
    report: vi.fn(),
    connect: async () => {},
    visitTown: () => {},
    update,
    run: (command, dispatch) => {
      const promise = room.run(command, dispatch)
      pending.push(promise)
      return promise
    },
    notify: vi.fn(),
    addChat: vi.fn(),
    toggleWindow: () => {},
    lookAtShop: () => {},
    enterMap: () => {},
  })
  room = new RoomClient(context)
  const messages = new ServerMessages(context)
  const actions = new DialogueActions(context)
  const ready = () => {
    const pages = session.state.get().dialogue!.pages.length
    for (let step = 0; step < pages * 2 + 1; step++) {
      const dialogue = session.state.get().dialogue!
      if (dialogue.page === dialogue.pages.length - 1 && fullyShown(dialogue)) return
      actions.advanceDialogue()
    }
    throw new Error("Native dialogue did not finish revealing")
  }
  const open = () => {
    actions.onReachResident(residentId)
    ready()
  }
  open()
  if (stage === "take") {
    const ask = session.state.get().dialogue!.choices.findIndex((choice) => choice.action === "errand-ask" && choice.errand === errand.id)
    expect(ask).toBeGreaterThanOrEqual(0)
    actions.choose(ask)
    ready()
  }
  const index = session.state.get().dialogue!.choices.findIndex((choice) => choice.action === (stage === "take" ? "errand-take" : "errand-hand") && choice.errand === errand.id)
  expect(index).toBeGreaterThanOrEqual(0)
  send.mockClear()
  return {
    session,
    actions,
    context,
    send,
    pending,
    initial,
    result,
    duplicate,
    index,
    open,
    reply(accepted: boolean) {
      const seq = [...session.waiting.keys()][0]
      expect(seq).toBeDefined()
      messages.handle({ type: "result", seq, result: accepted ? { ...result, state: restored } : duplicate })
    },
  }
}

for (const stage of ["take", "hand"] as const)
  for (const accepted of [true, false])
    for (const change of ["unchanged", "closed", "reopened", "connection"] as const)
      it.each(ERRANDS)(`$id ${stage}, accepted=${accepted}: a late reply preserves ${change} dialogue`, async (errand) => {
        const f = fixture(errand, stage)
        f.actions.choose(f.index)
        expect(f.session.waiting.size).toBe(1)
        expect(f.send.mock.calls[0][0]).toMatchObject({ type: "errand", action: stage, errand: errand.id })
        if (change === "closed" || change === "reopened") f.actions.closeDialogue()
        if (change === "reopened") f.open()
        const dialogue = f.session.state.get().dialogue
        vi.mocked(f.context.addChat).mockClear()
        f.reply(accepted)
        if (change === "connection") f.session.socket = { send: vi.fn() } as unknown as VoidSocket<"/map/:mapId">
        await Promise.all(f.pending)
        expect(f.session.waiting.size).toBe(0)
        expect(f.session.state.get().busy).toBe(false)
        expect(f.session.state.get().player).toEqual(accepted && change !== "connection" ? f.result.state : f.initial)
        if (change === "unchanged") {
          if (accepted) {
            expect(f.session.state.get().dialogue!.choices).toEqual([{ label: "さようなら", action: "close" }])
            if (stage === "hand") expect(f.session.state.get().dialogue!.pages).toEqual([errand.thanks])
          } else expect(f.session.state.get().dialogue).toBeNull()
        } else {
          expect(f.session.state.get().dialogue).toEqual(dialogue)
          expect(f.context.addChat).not.toHaveBeenCalled()
        }
      })

for (const stage of ["take", "hand"] as const)
  it.each(ERRANDS)(`$id ${stage}: repeated choice while waiting preserves the pending conversation`, async (errand) => {
    const f = fixture(errand, stage)
    const dialogue = f.session.state.get().dialogue
    f.actions.choose(f.index)
    f.actions.choose(f.index)
    await Promise.resolve()
    await Promise.resolve()
    expect(f.session.state.get().dialogue).toEqual(dialogue)
    expect(
      f.send.mock.calls.map((entry1) => {
        const message = entry1[0]
        return message.type
      }),
    ).toEqual(["errand"])
    expect(f.session.waiting.size).toBe(1)
    f.reply(true)
    await Promise.all(f.pending)
    expect(f.session.state.get().player).toEqual(f.result.state)
    expect(f.session.state.get().dialogue!.choices).toEqual([{ label: "さようなら", action: "close" }])
    expect(f.session.waiting.size).toBe(0)
    expect(f.session.state.get().busy).toBe(false)
  })
