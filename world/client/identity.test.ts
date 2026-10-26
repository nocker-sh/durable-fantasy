import { afterEach, expect, it, vi } from "vitest"
import { loadPlayerId } from "./identity.ts"

afterEach(() => vi.unstubAllGlobals())

it("keeps the same creation proof across a network failure and clears it after confirmation", async () => {
  const values = new Map<string, string>()
  vi.stubGlobal("navigator", {})
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  })
  const sent: { legacyId: string; proof: string }[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, options: RequestInit) => {
      const body = JSON.parse(options.body as string) as { legacyId: string; proof: string }
      sent.push(body)
      if (sent.length === 1) throw new Error("network interrupted")
      return Response.json({ id: body.legacyId })
    }),
  )
  await expect(loadPlayerId()).rejects.toThrow("network interrupted")
  const pending = values.get("durable-fantasy/session-proof")
  expect(pending).toBeDefined()
  const first = loadPlayerId()
  const second = loadPlayerId()
  expect(first).toBe(second)
  expect(await first).toBe(sent[0].legacyId)
  expect(sent[1]).toEqual(sent[0])
  expect(values.has("durable-fantasy/session-proof")).toBe(false)
})
