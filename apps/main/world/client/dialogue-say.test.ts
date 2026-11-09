import { expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { DialogueActions } from "#/world/client/dialogue"
import { GameSession } from "#/world/client/game-session"
import { NAME_MAX } from "#/world/core/player-rules"

function fixture() {
  const session = new GameSession()
  const send = vi.fn()
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  const addChat = vi.fn()
  const actions = new DialogueActions({ session, addChat, getScene: () => null, update: vi.fn(), run: vi.fn(), toggleWindow: vi.fn() })
  return { send, addChat, actions }
}

it("whispers to a name as long as names go", () => {
  const f = fixture()
  const name = "ハ".repeat(NAME_MAX)
  f.actions.say(`/w ${name} 内緒`)
  expect(f.send).toHaveBeenCalledExactlyOnceWith({ type: "whisper", to: name, text: "内緒" })
  expect(f.addChat).not.toHaveBeenCalled()
})

it("answers a whisper to a name longer than any as finding no one, without sending it", () => {
  const f = fixture()
  // the space after the name forgotten: the whole run becomes the name
  f.actions.say("/w 今日の夜に広場の噴水の前で待ってるね ハンスより")
  expect(f.send).not.toHaveBeenCalled()
  expect(f.addChat).toHaveBeenCalledExactlyOnceWith({ channel: "system", text: "その人はこのあたりにいない。" })
})
