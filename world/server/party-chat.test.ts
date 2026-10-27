import { expect, it, vi } from "vitest"
vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
import { Party } from "../../durable-objects/party.ts"
const member = (owner: string) => ({ owner, name: owner, level: 1, hp: 10, maxHp: 10, map: owner, at: 0 })
it("persists member boundaries and chat cursors across real Void state reloads", async () => {
  const saved = new Map<string, unknown>()
  const context = {
    id: { toString: () => "test-party" },
    blockConcurrencyWhile: <T>(fn: () => Promise<T>) => fn(),
    storage: {
      get: async (key: string) => structuredClone(saved.get(key)),
      put: vi.fn(async (key: string, value: unknown) => {
        saved.set(key, structuredClone(value))
      }),
    },
  }
  const restart = () => new Party.class(context as unknown as DurableObjectState, {})
  await restart().join(member("a"))
  await restart().join(member("b"))
  // Existing parties were saved before the chat field was introduced.
  for (const record of saved.values()) delete (record as { value: { chat?: unknown } }).value.chat
  expect((await restart().view()).members.map((member) => member.owner)).toEqual(["a", "b"])
  expect(await restart().chat("b", 0)).toEqual({ seq: 0, lines: [] })
  expect(await restart().say("a", "仲間だけ")).toBeNull()
  const writes = context.storage.put.mock.calls.length
  const { party, chat: first } = await restart().poll("b", { ...member("b"), hp: 7 }, 0)
  expect(party.members.find((member) => member.owner === "b")?.hp).toBe(7)
  expect(context.storage.put).toHaveBeenCalledTimes(writes + 1)
  expect(first?.lines.map((line) => line.text)).toEqual(["仲間だけ"])
  expect(await restart().chat("outsider", 0)).toBeNull()
  await restart().join(member("c"))
  expect((await restart().chat("c", 0))?.lines).toEqual([])
  expect((await restart().chat("b", first!.seq))?.lines).toEqual([])
  await restart().leave("b")
  expect(await restart().say("b", "脱退後")).toBe("NOT_MEMBER")
  expect(await restart().chat("b", 0)).toBeNull()
})
