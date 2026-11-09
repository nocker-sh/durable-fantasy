import { expect, it } from "vitest"
import { moveBlockedText } from "#/world/parts/move-blocked-text"
import type { GameState } from "#/world/state"

const free = { dialogue: null, shop: null, commission: null, storage: false, trade: null } satisfies Pick<GameState, "dialogue" | "shop" | "commission" | "storage" | "trade">
const side = { stacks: [], gold: 0, locked: false, done: false }

it("lets the channel or the town change only with nothing of this room in hand", () => {
  expect(moveBlockedText(free)).toBeNull()
  expect(moveBlockedText({ ...free, dialogue: { resident: 0, name: "アルノルト", job: "鍛冶屋", pages: [""], page: 0, choices: [], shownAt: 0 } })).toBe("会話や店の最中は移れない。")
  expect(moveBlockedText({ ...free, shop: "bakery" })).toBe("会話や店の最中は移れない。")
  expect(moveBlockedText({ ...free, commission: "アルノルト" })).toBe("会話や店の最中は移れない。")
  expect(moveBlockedText({ ...free, storage: true })).toBe("会話や店の最中は移れない。")
  expect(moveBlockedText({ ...free, trade: { with: "other", name: "Hans", lots: [], mine: side, theirs: side } })).toBe("取引の最中は移れない。")
})
