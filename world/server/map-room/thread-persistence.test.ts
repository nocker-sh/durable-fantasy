import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { newPlayer } from "#/world/core/new-player"
import { threadOf } from "#/world/core/thread-of"
import type { PlayerState } from "#/world/core/player-types"
import type { ServerMessage } from "#/world/protocol"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { handleThreadAsk } from "#/world/server/map-room/handle-thread-ask"
import { handleThreadAnswer } from "#/world/server/map-room/handle-thread-answer"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { setPresence } from "#/world/server/map-room/set-presence"
import type { Presence } from "#/world/server/map-room/presence"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

async function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(100_000)
  const recipientOwner = "00000000-0000-4000-8000-000000000001"
  const askerOwner = "00000000-0000-4000-8000-000000000002"
  const recipientStore = durableStorage({ ...initialPlayerRecord(), player: newPlayer("Self") }, 8)
  const askerStore = durableStorage({ ...initialPlayerRecord(), player: newPlayer("Peer") }, 8)
  const recipientActor = new Player.class(recipientStore.state, {})
  const askerActor = new Player.class(askerStore.state, {})
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
    if (owner === recipientOwner) return recipientActor as unknown as ReturnType<typeof Player.get>
    if (owner === askerOwner) return askerActor as unknown as ReturnType<typeof Player.get>
    throw new Error("Unexpected player")
  })
  function connection(id: string, owner: string, name: string) {
    const socket = {
      id,
      state: { owner, player: mapPlayer(id, newPlayer(name), [10, 10]), route: [[10, 10]], since: Date.now(), said: [], engaged: null } as Presence,
      send: vi.fn(async (_message: ServerMessage) => {}),
      setState(state: Presence) {
        socket.state = state
      },
    }
    return socket
  }
  const recipient = connection("self", recipientOwner, "Self")
  const asker = connection("peer", askerOwner, "Peer")
  const askRoom = {
    me: asker.state,
    save: (patch: Partial<Presence>) => setPresence(asker, patch),
    ctx: { connection: asker, room: { getConnection: (id: string) => (id === recipient.id ? recipient : undefined) } },
  }
  await handleThreadAsk(askRoom, { type: "thread-ask", target: recipient.id })
  expect(asker.state.threading).toBe(recipient.id)
  expect(recipient.send).toHaveBeenCalledWith({ type: "thread-asked", from: asker.id, name: "Peer" })
  recipient.send.mockClear()
  asker.send.mockClear()
  const room = { me: recipient.state, ctx: { connection: recipient, room: { getConnection: (id: string) => (id === asker.id ? asker : undefined) } } }
  const answer = (yes = true) => handleThreadAnswer(room, { type: "thread-answer", from: asker.id, yes })
  const stored = (storage: ReturnType<typeof durableStorage>) => (storage.saved.get("__void_durable_state") as { value: { player: PlayerState } }).value.player
  const saved = () => ({ recipient: structuredClone(stored(recipientStore)), asker: structuredClone(stored(askerStore)) })
  return { recipient, asker, recipientOwner, askerOwner, recipientActor, askerActor, recipientStore, askerStore, answer, saved }
}

it.each(["recipient", "asker"] as const)("persists both threads when the %s result notification fails, and consumes the invitation once", async (failedSocket) => {
  const f = await fixture()
  const before = f.saved()
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  f[failedSocket].send.mockRejectedValueOnce(new Error("Connection closed"))
  const completed = await Promise.allSettled([f.answer()])
  const saved = f.saved()
  expect(saved.recipient.threads).toEqual([threadOf(f.askerOwner, "Peer", Date.now())])
  expect(saved.asker.threads).toEqual([threadOf(f.recipientOwner, "Self", Date.now())])
  expect(completed).toEqual([{ status: "fulfilled", value: undefined }])
  expect(warn).toHaveBeenCalledOnce()
  expect(f.asker.state.threading).toBeUndefined()
  for (const side of ["recipient", "asker"] as const) {
    expect(saved[side].gold).toBe(before[side].gold)
    expect(saved[side].bag).toEqual(before[side].bag)
    expect(saved[side].equipment).toEqual(before[side].equipment)
  }
  // Restart actual player actors from the written envelopes, rather than only inspecting their live state.
  const resumedRecipient = new Player.class(f.recipientStore.state, {})
  const resumedAsker = new Player.class(f.askerStore.state, {})
  expect((await resumedRecipient.read()).threads).toEqual(saved.recipient.threads)
  expect((await resumedAsker.read()).threads).toEqual(saved.asker.threads)
  const beforeReplay = f.saved()
  await f.answer()
  expect(f.saved()).toEqual(beforeReplay)
  expect(warn).toHaveBeenCalledOnce()
})

it.each(["recipient", "asker"] as const)("propagates the %s durable save failure instead of treating it as a notification failure", async (failedSave) => {
  const f = await fixture()
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const storage = failedSave === "recipient" ? f.recipientStore : f.askerStore
  storage.failNextSave()
  await expect(f.answer()).rejects.toThrow("Storage unavailable")
  expect(warn).not.toHaveBeenCalled()
  expect(f.asker.state.threading).toBeUndefined()
  const saved = f.saved()
  expect(saved.asker.threads).toEqual([])
  expect(saved.recipient.threads).toEqual(failedSave === "recipient" ? [] : [threadOf(f.askerOwner, "Peer", Date.now())])
  expect(f.asker.send).not.toHaveBeenCalled()
})

it("leaves both players' saved contacts unchanged when the invitation is declined", async () => {
  const f = await fixture()
  const before = f.saved()
  await f.answer(false)
  expect(f.saved()).toEqual(before)
  expect(f.asker.state.threading).toBeUndefined()
  expect(f.asker.send).toHaveBeenCalledExactlyOnceWith({ type: "thread-closed", reason: "DECLINED" })
  expect(f.recipient.send).not.toHaveBeenCalled()
})

it("does not give the asker a thread when the authoritative recipient became fallen after the request", async () => {
  const f = await fixture()
  const hurt = await f.recipientActor.run({ type: "hurt", amount: 9999, by: "slime" })
  expect(hurt.ok).toBe(true)
  const before = f.saved()
  await f.answer()
  expect(f.saved()).toEqual(before)
  expect(f.asker.state.threading).toBeUndefined()
  expect(f.recipient.send).toHaveBeenCalledWith({ type: "result", seq: -1, result: { ok: false, reason: "FALLEN" } })
  expect(f.asker.send).toHaveBeenCalledExactlyOnceWith({ type: "thread-closed", reason: "BUSY" })
})
