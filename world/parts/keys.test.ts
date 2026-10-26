import { afterEach, expect, it, vi } from "vitest"
import { Keys, type KeyTarget } from "./keys"
import { createGameState } from "../client/initial-state"

const cleanups: (() => void)[] = []
afterEach(() => {
  for (const clean of cleanups.splice(0)) clean()
  vi.unstubAllGlobals()
})

function fixture() {
  const window = new EventTarget()
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
      key: { value: code === "Enter" ? "Enter" : code.replace("Key", "").toLowerCase() },
      repeat: { value: repeat },
      target: { value: { closest: () => null } },
    })
    window.dispatchEvent(event)
  }
  return { game, keys, key, window }
}

it("combines movement keys into eight directions and cancels opposite aliases equally", () => {
  const { key, game } = fixture()
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
  const { key, game } = fixture()
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
  const { key, game, window, keys } = fixture()
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
