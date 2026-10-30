import { expect, it, vi } from "vitest"
import { ServerMessages } from "./server-messages"

type Context = ConstructorParameters<typeof ServerMessages>[0]
it("deduplicates polled messages across map changes and ignores a departed party", () => {
  const player = { party: "party-a" as string | null }
  const session = { net: { messages: 0, bytes: 0 }, partyChat: { party: "", seq: 0 }, state: { get: () => ({ player }) } }
  const addChat = vi.fn()
  const bubble = vi.fn()
  const messages = new ServerMessages({ session, addChat, getScene: () => ({ bubble }) } as unknown as Context)
  const batch = {
    type: "party-chat" as const,
    party: "party-a",
    seq: 2,
    lines: [
      { seq: 1, name: "エルナ", text: "待ってる", self: false },
      { seq: 2, name: "フリッツ", text: "向かう", self: true },
    ],
  }
  messages.handle(batch)
  messages.handle(batch)
  messages.handle({ ...batch, seq: 1, lines: batch.lines.slice(0, 1) })
  expect(addChat).toHaveBeenCalledTimes(2)
  expect(addChat).toHaveBeenLastCalledWith({ channel: "party", name: "フリッツ", text: "向かう", self: true })
  expect(session.partyChat.seq).toBe(2)
  expect(bubble).not.toHaveBeenCalled()
  player.party = null
  messages.handle({ ...batch, seq: 3, lines: [{ ...batch.lines[0], seq: 3 }] })
  expect(addChat).toHaveBeenCalledTimes(2)
})
