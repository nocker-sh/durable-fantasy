import { afterEach, expect, it, vi } from "vitest"
import { HEARING_CELLS } from "../../protocol.ts"
import { player } from "../../test/helpers.ts"
import { mapPlayer, type Presence } from "./presence.ts"
import type { Ctx } from "./context.ts"
import { HANDLERS } from "./chat.ts"

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function fixture() {
  const connection = (id: string, x: number, closed = false) => ({
    id,
    state: { player: mapPlayer(id, player(), [x, 0]), owner: id, route: [[x, 0]], since: Date.now(), said: [], engaged: null, closed } as Presence,
    send: vi.fn(async () => {}),
  })
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
  } as unknown as Ctx
  return { context, self, failed, nearby, far, closed }
}

it.each([false, true])("delivers speech after a recipient disconnects while respecting the range: shout=%s", async (shout) => {
  vi.spyOn(console, "warn").mockImplementation(() => {})
  const f = fixture()
  await HANDLERS.say!(f.context, { type: "say", text: "こんにちは", shout })
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
  for (let i = 0; i < 3; i++) await HANDLERS.say!(f.context, { type: "say", text: "こんにちは" })
  expect(f.nearby.send).toHaveBeenCalledTimes(2)
  vi.setSystemTime(2000)
  await HANDLERS.say!(f.context, { type: "say", text: "こんばんは" })
  expect(f.nearby.send).toHaveBeenCalledTimes(3)
})

it("bounds stored attempts during a burst without changing acceptance or cooldown extension", async () => {
  vi.useFakeTimers()
  vi.spyOn(console, "warn").mockImplementation(() => {})
  const f = fixture()
  f.failed.send.mockResolvedValue()
  // Reference the original rolling-window rule, including rejected attempts.
  let history: number[] = []
  let delivered = 0
  const times = [...Array.from({ length: 2000 }, (_, i) => 1000 + Math.floor(i / 10)), 1500, 2199, 2200, 2500, 3199, 3200, 4200, 4200, 4200]
  for (const now of times) {
    vi.setSystemTime(now)
    history = [...history.filter((at) => now - at < 1000), now]
    if (history.length <= 2) delivered++
    await HANDLERS.say!(f.context, { type: "say", text: "こんにちは" })
    expect(f.nearby.send).toHaveBeenCalledTimes(delivered)
    expect(f.self.state.said.length).toBeLessThanOrEqual(2)
  }
  expect(delivered).toBeGreaterThan(2)
})
