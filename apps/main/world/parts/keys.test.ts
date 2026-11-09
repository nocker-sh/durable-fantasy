import { afterEach, expect, it, vi } from "vitest"
import { Keys, type KeyTarget } from "#/world/parts/keys"
import { createGameState } from "#/world/client/initial-state"

const cleanups: (() => void)[] = []
afterEach(() => {
  for (const clean of cleanups.splice(0)) clean()
  vi.unstubAllGlobals()
})

function fixture() {
  const document = Object.assign(new EventTarget(), { hidden: false })
  const window = Object.assign(new EventTarget(), { document })
  vi.stubGlobal("window", window)
  const state = createGameState()
  state.set({ ...state.get(), loading: null })
  const game = { state, hold: vi.fn(), stopWalking: vi.fn(), setTyping: vi.fn() }
  const keys = new Keys(game as unknown as KeyTarget)
  keys.listen()
  cleanups.push(() => keys.unlisten())
  const key = (code: string, type = "keydown", repeat = false) => {
    const event = new Event(type)
    Object.defineProperties(event, {
      code: { value: code },
      key: { value: code === "Enter" || code === "Escape" ? code : code.replace("Key", "").toLowerCase() },
      repeat: { value: repeat },
      target: { value: { closest: () => null } },
    })
    window.dispatchEvent(event)
  }
  return { game, keys, key, window, document }
}

it("combines movement keys into eight directions and cancels opposite aliases equally", () => {
  const parts1 = fixture()
  const key = parts1.key,
    game = parts1.game
  key("KeyW")
  expect(game.hold).toHaveBeenLastCalledWith([0, 1])
  key("KeyD")
  expect(game.hold).toHaveBeenLastCalledWith([1, 1])
  key("KeyD", "keyup")
  key("ArrowUp")
  key("KeyS")
  expect(game.hold).toHaveBeenLastCalledWith(null)
  key("KeyW", "keyup")
  expect(game.hold).toHaveBeenLastCalledWith(null)
  key("ArrowUp", "keyup")
  expect(game.hold).toHaveBeenLastCalledWith([0, -1])
})

it("releases walking before opening chat and ignores repeats until a fresh press", () => {
  const parts2 = fixture()
  const key = parts2.key,
    game = parts2.game
  key("KeyW")
  key("Enter")
  expect(game.setTyping).toHaveBeenCalledWith(true)
  expect(game.hold).toHaveBeenLastCalledWith(null)
  expect(game.stopWalking).toHaveBeenCalledOnce()
  key("KeyW", "keydown", true)
  expect(game.hold).toHaveBeenLastCalledWith(null)
  key("KeyW", "keyup")
  key("KeyW")
  expect(game.hold).toHaveBeenLastCalledWith([0, 1])
})

it.each(["focusin", "blur", "unlisten"])("releases held movement on %s without stopping unrelated click walking", (type) => {
  const parts3 = fixture()
  const key = parts3.key,
    game = parts3.game,
    window = parts3.window,
    keys = parts3.keys
  const event = new Event(type)
  Object.defineProperty(event, "target", { value: { closest: () => ({}) } })
  const trigger = () => (type === "unlisten" ? keys.unlisten() : window.dispatchEvent(event))
  trigger()
  expect(game.stopWalking).not.toHaveBeenCalled()
  keys.listen()
  key("KeyW")
  trigger()
  expect(game.hold).toHaveBeenLastCalledWith(null)
  expect(game.stopWalking).toHaveBeenCalledOnce()
})

it.each([{ modal: "system" as const }, { typing: true }, { storage: true }, { commission: "smith" }, { loading: { map: "town", text: "loading" } }])(
  "releases movement immediately when blocking state opens: %j",
  (patch) => {
    const parts4 = fixture()
    const key = parts4.key,
      game = parts4.game
    const initial = game.state.get()
    key("KeyW")
    key("KeyD")
    // Opening with a mouse or server event need not produce another keyboard event.
    game.state.set({ ...initial, ...patch })
    expect(game.hold).toHaveBeenLastCalledWith(null)
    expect(game.stopWalking).toHaveBeenCalledOnce()
    game.state.set(initial)
    key("KeyW", "keydown", true)
    key("KeyD", "keyup")
    expect(game.hold).toHaveBeenLastCalledWith(null)
    key("KeyW", "keyup")
    key("KeyW")
    expect(game.hold).toHaveBeenLastCalledWith([0, 1])
  },
)

it("keeps click walking and nonblocking windows independent of held-key cleanup", () => {
  const parts5 = fixture()
  const key = parts5.key,
    game = parts5.game
  game.state.set({ ...game.state.get(), storage: true })
  expect(game.stopWalking).not.toHaveBeenCalled()
  game.state.set({ ...game.state.get(), storage: false })
  key("KeyW")
  game.state.set({ ...game.state.get(), windows: ["inventory"] })
  expect(game.hold).toHaveBeenLastCalledWith([0, 1])
  expect(game.stopWalking).not.toHaveBeenCalled()
})

it("removes state and visibility listeners when unlistened and registers once on relisten", () => {
  const parts6 = fixture()
  const keys = parts6.keys,
    key = parts6.key,
    game = parts6.game,
    document = parts6.document
  const added = vi.spyOn(document, "addEventListener")
  const removed = vi.spyOn(document, "removeEventListener")
  const subscribe = vi.spyOn(game.state, "subscribe")
  const unsubscribe = vi.fn()
  subscribe.mockReturnValue(unsubscribe)
  keys.listen()
  keys.listen()
  expect(unsubscribe).toHaveBeenCalledOnce()
  key("KeyW")
  keys.unlisten()
  expect(unsubscribe).toHaveBeenCalledTimes(2)
  expect(game.stopWalking).toHaveBeenCalledOnce()
  const registrations = added.mock.calls.filter((entry7) => {
    const event = entry7[0]
    return event === "visibilitychange"
  })
  expect(registrations).toHaveLength(2)
  expect(
    removed.mock.calls
      .filter((entry8) => {
        const event = entry8[0]
        return event === "visibilitychange"
      })
      .slice(-2),
  ).toEqual(registrations)
})

it("closes the front-most window the player opened on Esc, past a shop still in the stacking order", () => {
  const f = fixture()
  const closeWindow = vi.fn()
  Object.assign(f.game, { closeWindow })
  f.game.state.set({ ...f.game.state.get(), windows: ["minimap", "chat", "syslog", "skills", "shop"] })
  f.key("Escape")
  expect(closeWindow).toHaveBeenCalledExactlyOnceWith("skills")
})

it("never uses the hotbar for a number pressed before a conversation's choices show", () => {
  const parts9 = fixture()
  const game = parts9.game,
    window = parts9.window
  const target = game as unknown as { useHotbar: ReturnType<typeof vi.fn>; choose: ReturnType<typeof vi.fn> }
  target.useHotbar = vi.fn()
  target.choose = vi.fn()
  game.state.set((s) => ({
    ...s,
    dialogue: { resident: 0, name: "ハンス", job: "", pages: ["一枚目", "二枚目"], page: 0, choices: [{ label: "さようなら", action: "close" }], shownAt: 0 },
  }))
  const event = new Event("keydown")
  Object.defineProperties(event, { code: { value: "Digit1" }, key: { value: "1" }, repeat: { value: false }, target: { value: { closest: () => null } } })
  window.dispatchEvent(event)
  expect(target.useHotbar).not.toHaveBeenCalled()
  expect(target.choose).not.toHaveBeenCalled()
})
