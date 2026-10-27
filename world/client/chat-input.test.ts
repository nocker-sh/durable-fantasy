import { expect, it } from "vitest"
import { parseChatInput } from "./chat-input.ts"

it.each(["/p", "/p 仲間だけ", " /p\t仲間だけ ", "/w", "/w エルナ 内緒", "/w\nエルナ 内緒"])("does not turn an unsupported private command into public speech: %s", (text) => {
  expect(parseChatInput(text)?.kind).toBe("unavailable")
})
it.each(["", "   ", "/s", " /s   "])("ignores empty speech: %s", (text) => {
  expect(parseChatInput(text)).toBeNull()
})
it("keeps public speech and shouts within the message limit after stripping the command", () => {
  expect(parseChatInput("  こんにちは  ")).toEqual({ kind: "message", text: "こんにちは", shout: false })
  expect(parseChatInput("/s\tこんにちは")).toEqual({ kind: "message", text: "こんにちは", shout: true })
  expect(parseChatInput("/s " + "あ".repeat(150))).toEqual({ kind: "message", text: "あ".repeat(140), shout: true })
})
