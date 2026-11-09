import { afterEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import type { GameState } from "#/world/state"
import type { MapPlayer } from "#/world/protocol"
import type { MapScene } from "#/world/scene/runtime/scene"
import { GameSession } from "#/world/client/game-session"
import { createSessionContext } from "#/world/client/create-session-context"
import { ServerMessages } from "#/world/client/server-messages"
import { SocialActions } from "#/world/client/social"
import { remoteAvatar } from "#/world/client/remote-avatar"

const KEY = "durable-fantasy/muted"

afterEach(() => vi.unstubAllGlobals())

const someone = (id: string, name: string): MapPlayer => ({ id, name, look: 0, neck: "muffler", neckRamp: "cRed", weapon: null, at: [4, 4] })

function fixture() {
  const stored = new Map<string, string>()
  vi.stubGlobal("localStorage", { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value) })
  const session = new GameSession()
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  const scene = { bubble: vi.fn(), hush: vi.fn(), removeRemote: vi.fn() }
  const notify = vi.fn()
  const serial = { line: 0 }
  const update = (patch: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => session.state.set((state) => ({ ...state, ...(typeof patch === "function" ? patch(state) : patch) }))
  const context = createSessionContext(session, {
    getScene: () => scene as unknown as MapScene,
    preview: () => null,
    onServer: vi.fn(),
    wayBeside: () => null,
    standBy: vi.fn(),
    avatarOf: remoteAvatar,
    setPlayer: vi.fn(),
    maybeReady: vi.fn(),
    report: vi.fn(),
    connect: async () => {},
    visitTown: vi.fn(),
    update,
    run: async () => false,
    notify,
    addChat: (line) => update((state) => ({ chat: [...state.chat, { ...line, id: ++serial.line }] })),
    toggleWindow: vi.fn(),
    lookAtShop: vi.fn(),
    enterMap: vi.fn(),
  })
  session.others.welcome("me", [someone("loud", "ハンス"), someone("quiet", "グレーテ")])
  const texts = () => session.state.get().chat.map((line) => line.text)
  return { session, stored, send, scene, notify, texts, messages: new ServerMessages(context), social: new SocialActions(context) }
}

it("shows neither chat lines nor bubbles from a muted player, and keeps everyone else's", () => {
  const f = fixture()
  f.social.mute("loud")
  f.messages.handle({ type: "said", id: "loud", text: "聞いて", shout: false })
  f.messages.handle({ type: "said", id: "loud", text: "聞け", shout: true })
  f.messages.handle({ type: "whispered", from: "loud", name: "ハンス", text: "ねえ" })
  f.messages.handle({ type: "said", id: "quiet", text: "こんにちは", shout: false })
  f.messages.handle({ type: "whispered", from: "quiet", name: "グレーテ", text: "あとで" })
  // our own whisper to the muted player is ours, and still shows
  f.messages.handle({ type: "whispered", name: "ハンス", text: "やめて", sent: true })
  expect(f.scene.bubble).toHaveBeenCalledExactlyOnceWith("quiet", "こんにちは")
  expect(f.texts()).toEqual(["こんにちは", "あとで", "やめて"])
  expect(f.session.state.get().chat.map((line) => line.from)).toEqual(["quiet", "quiet", undefined])
})

it("declines a muted player's trade, party and thread requests without showing them", () => {
  const f = fixture()
  f.social.mute("loud")
  f.messages.handle({ type: "trade-asked", from: "loud", name: "ハンス" })
  f.messages.handle({ type: "party-invited", from: "loud", name: "ハンス" })
  f.messages.handle({ type: "thread-asked", from: "loud", name: "ハンス" })
  expect(f.send.mock.calls.map((call) => call[0])).toEqual([
    { type: "trade-answer", from: "loud", yes: false },
    { type: "party-answer", from: "loud", yes: false },
    { type: "thread-answer", from: "loud", yes: false },
  ])
  const state = f.session.state.get()
  expect([state.tradeAsk, state.partyAsk, state.threadAsk]).toEqual([null, null, null])
  f.messages.handle({ type: "trade-asked", from: "quiet", name: "グレーテ" })
  expect(f.session.state.get().tradeAsk).toEqual({ from: "quiet", name: "グレーテ" })
  expect(f.send).toHaveBeenCalledTimes(3)
})

it("muting takes away their shown lines, bubble and waiting request, and unmuting lets new ones through", () => {
  const f = fixture()
  f.messages.handle({ type: "said", id: "loud", text: "一", shout: false })
  f.messages.handle({ type: "whispered", from: "loud", name: "ハンス", text: "二" })
  f.messages.handle({ type: "said", id: "quiet", text: "三", shout: false })
  f.messages.handle({ type: "trade-asked", from: "loud", name: "ハンス" })
  f.messages.handle({ type: "party-invited", from: "quiet", name: "グレーテ" })
  f.session.state.set((state) => ({ ...state, playerMenu: { id: "loud", name: "ハンス" } }))
  f.social.mute("loud")
  const muted = f.session.state.get()
  expect(muted.playerMenu).toBeNull()
  expect(muted.muted).toEqual(["loud"])
  expect(JSON.parse(f.stored.get(KEY)!)).toEqual(["loud"])
  expect(f.texts()).toEqual(["三"])
  expect(f.scene.hush).toHaveBeenCalledExactlyOnceWith("loud")
  expect(f.send).toHaveBeenCalledExactlyOnceWith({ type: "trade-answer", from: "loud", yes: false })
  expect(muted.tradeAsk).toBeNull()
  expect(muted.partyAsk).toEqual({ from: "quiet", name: "グレーテ" })
  expect(f.notify).toHaveBeenLastCalledWith("ハンスをミュートした。")
  f.social.unmute("loud")
  expect(f.session.state.get().muted).toEqual([])
  expect(f.notify).toHaveBeenLastCalledWith("ハンスのミュートを解いた。")
  f.messages.handle({ type: "said", id: "loud", text: "四", shout: false })
  expect(f.texts()).toEqual(["三", "四"])
})

it("keeps the mute across a reload while that connection stays, and forgets it once the connection leaves", () => {
  const first = fixture()
  first.social.mute("loud")
  const reloaded = new GameSession()
  reloaded.mutes.load()
  expect(reloaded.mutes.has("loud")).toBe(true)
  first.messages.handle({ type: "left", id: "loud" })
  expect(first.session.state.get().muted).toEqual([])
  expect(JSON.parse(first.stored.get(KEY)!)).toEqual([])
})
