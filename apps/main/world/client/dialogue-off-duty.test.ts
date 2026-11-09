import { expect, it, vi } from "vitest"
import { DialogueActions } from "#/world/client/dialogue"
import { GameSession } from "#/world/client/game-session"
import { keepingShop } from "#/world/parts/keeping-shop"
import { player } from "#/world/test/player"
import type { GameState } from "#/world/state"

it("says the shop is shut and offers what the keeper does now when their shift ended with the menu open", () => {
  // a minute at which the smith is not at his counter
  const min = Array.from({ length: 96 }, (_, index) => index * 15).find((minute) => !keepingShop("アルノルト", minute))!
  const session = new GameSession()
  session.state.set((s) => ({
    ...s,
    player: player(),
    clock: { ...s.clock, min },
    dialogue: {
      resident: 0,
      name: "アルノルト",
      job: "鍛冶屋",
      pages: [""],
      page: 0,
      choices: [
        { label: "買い物をする", action: "shop" },
        { label: "さようなら", action: "close" },
      ],
      shownAt: 0,
    },
  }))
  const addChat = vi.fn()
  const actions = new DialogueActions({
    session,
    addChat,
    getScene: () => null,
    run: vi.fn(),
    toggleWindow: vi.fn(),
    update: (patch) => session.state.set((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }) as GameState),
  })
  actions.choose(0)
  expect(addChat).toHaveBeenCalledWith({ channel: "system", text: "いまは店を開けていない。" })
  const state = session.state.get()
  expect(state.shop).toBeNull()
  expect(state.dialogue?.choices.some((choice) => choice.action === "shop")).toBe(false)
})
