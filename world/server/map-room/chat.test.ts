import { afterEach, expect, it, vi } from "vitest"
import { HEARING_CELLS } from "#/world/protocol"
import { player } from "#/world/test/player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import { handleSpeech } from "#/world/server/map-room/handle-speech"

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function fixture() {
  const connection = (id: string, x: number, closed = false) => {
    const state: Presence = { player: mapPlayer(id, player(), [x, 0]), owner: id, route: [[x, 0]], since: Date.now(), said: [], engaged: null, closed }
    return { id, state, send: vi.fn(async () => {}) }
  }
  const self = connection("self", 0),
    failed = connection("failed", 1),
    nearby = connection("nearby", HEARING_CELLS),
    far = connection("far", HEARING_CELLS + 1),
    closed = connection("closed", 0, true)
  failed.send.mockRejectedValue(Error("Socket closed"))
  const context = {
    ctx: { connection: self, room: { getConnections: () => [self, failed, nearby, far, closed] } },
    me: self.state,
    save: (patch: Partial<Presence>) => Object.assign(self.state, patch),
  }
  return { context, self, failed, nearby, far, closed }
}

it.each([false, true])("delivers speech after a recipient disconnects while respecting the range: shout=%s", async (shout) => {
  vi.spyOn(console, "warn").mockImplementation(() => {})
  const f = fixture()
  await handleSpeech(f.context, { type: "say", text: "こんにちは", shout })
  expect(f.nearby.send).toHaveBeenCalledExactlyOnceWith({ type: "said", id: "self", text: "こんにちは", shout })
  expect(f.far.send).toHaveBeenCalledTimes(shout ? 1 : 0)
  expect(f.self.send).not.toHaveBeenCalled()
  expect(f.closed.send).not.toHaveBeenCalled()
  expect(console.warn).toHaveBeenCalledOnce()
})

it("retains the two-line limit even when a recipient cannot receive", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  vi.spyOn(console, "warn").mockImplementation(() => {})
  const f = fixture()
  for (const _attempt of [0, 1, 2]) await handleSpeech(f.context, { type: "say", text: "こんにちは" })
  expect(f.nearby.send).toHaveBeenCalledTimes(2)
  vi.setSystemTime(2000)
  await handleSpeech(f.context, { type: "say", text: "こんばんは" })
  expect(f.nearby.send).toHaveBeenCalledTimes(3)
})

it("bounds stored attempts during a burst without changing acceptance or cooldown extension", async () => {
  vi.useFakeTimers()
  vi.spyOn(console, "warn").mockImplementation(() => {})
  const f = fixture()
  f.failed.send.mockResolvedValue()
  // Reference the original rolling-window rule, including rejected attempts.
  const reference: { history: number[]; delivered: number } = { history: [], delivered: 0 }
  const times = [...Array.from({ length: 2000 }, (_, i) => 1000 + Math.floor(i / 10)), 1500, 2199, 2200, 2500, 3199, 3200, 4200, 4200, 4200]
  for (const now of times) {
    vi.setSystemTime(now)
    reference.history = [...reference.history.filter((at) => now - at < 1000), now]
    if (reference.history.length <= 2) reference.delivered++
    await handleSpeech(f.context, { type: "say", text: "こんにちは" })
    expect(f.nearby.send).toHaveBeenCalledTimes(reference.delivered)
    expect(f.self.state.said.length).toBeLessThanOrEqual(2)
  }
  expect(reference.delivered).toBeGreaterThan(2)
})

it.each([false, true])("handles an unlocated speaker without inventing local hearing: shout=%s", async (shout) => {
  vi.spyOn(console, "warn").mockImplementation(() => {})
  const request = fixture()
  request.self.state.route = []
  await expect(handleSpeech(request.context, { type: "say", text: "こんにちは", shout })).resolves.toBeUndefined()
  expect(request.nearby.send).toHaveBeenCalledTimes(shout ? 1 : 0)
  expect(request.far.send).toHaveBeenCalledTimes(shout ? 1 : 0)
  expect(request.self.send).not.toHaveBeenCalled()
  expect(request.closed.send).not.toHaveBeenCalled()
})
