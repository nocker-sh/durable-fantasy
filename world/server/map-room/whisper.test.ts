import { expect, it, vi } from "vitest"
import { handleWhisper } from "#/world/server/map-room/handle-whisper"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { player } from "#/world/test/player"
import type { Presence } from "#/world/server/map-room/presence"

function fixture() {
  const connection = (id: string, name: string) => {
    const state: Presence = { player: mapPlayer(id, player({ name }), [0, 0]), owner: id, route: [[0, 0]], since: Date.now(), said: [], engaged: null }
    return { id, state, send: vi.fn(async () => {}) }
  }
  const self = connection("self", "ハンナ"),
    friend = connection("friend", "ヴェルナ"),
    other = connection("other", "ルッツ")
  const context = {
    ctx: { connection: self, room: { getConnections: () => [self, friend, other] } },
    me: self.state,
    save: (patch: Partial<Presence>) => Object.assign(self.state, patch),
  }
  return { context, self, friend, other }
}

it("reaches only the named player in the channel and echoes it back to the speaker", async () => {
  const f = fixture()
  await handleWhisper(f.context, { type: "whisper", to: "ヴェルナ", text: "あとで" })
  expect(f.friend.send).toHaveBeenCalledExactlyOnceWith({ type: "whispered", name: "ハンナ", text: "あとで" })
  expect(f.other.send).not.toHaveBeenCalled()
  expect(f.self.send).toHaveBeenCalledExactlyOnceWith({ type: "whispered", name: "ヴェルナ", text: "あとで", sent: true })
})

it("says when nobody of that name is here", async () => {
  const f = fixture()
  await handleWhisper(f.context, { type: "whisper", to: "だれか", text: "あとで" })
  expect(f.self.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "whisper", reason: "NOT_HERE" })
  expect(f.friend.send).not.toHaveBeenCalled()
})
