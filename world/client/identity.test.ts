import { afterEach, expect, it, vi } from "vitest"
import { playerId } from "#/world/core/identity"
import { loadPlayerId } from "#/world/client/load-player-id"

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

const localId = "00000000-0000-4000-8000-000000000001"
const confirmedId = "00000000-0000-4000-8000-000000000002"
const proof = "ab".repeat(32)

it.each([{}, null, [], { id: null }, { id: 7 }, { id: "" }, { id: "-".repeat(36) }, { id: "not-a-player" }])(
  "an invalid successful session response preserves recovery identity and proof: %j",
  async (response) => {
    const values = new Map([
      ["durable-fantasy/player", localId],
      ["durable-fantasy/session-proof", proof],
    ])
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
    const sent: unknown[] = []
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, options: RequestInit) => {
        sent.push(JSON.parse(options.body as string))
        return Response.json(sent.length === 1 ? response : { id: confirmedId })
      }),
    )
    await expect(loadPlayerId()).rejects.toThrow()
    expect(values.get("durable-fantasy/player")).toBe(localId)
    expect(values.get("durable-fantasy/session-proof")).toBe(proof)
    expect(await loadPlayerId()).toBe(confirmedId)
    expect(sent).toEqual([
      { legacyId: localId, proof },
      { legacyId: localId, proof },
    ])
    expect(values.get("durable-fantasy/player")).toBe(confirmedId)
    expect(values.has("durable-fantasy/session-proof")).toBe(false)
  },
)

it.each(["-".repeat(36), "f".repeat(36), "ABCDEFAB-CDEF-4ABC-8DEF-ABCDEFABCDEF"])("uses the server's identifier rules when recovering a stored player: %s", async (stored) => {
  const values = new Map([
    ["durable-fantasy/player", stored],
    ["durable-fantasy/session-proof", proof],
  ])
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
  let requested = ""
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, options: RequestInit) => {
      const body = JSON.parse(options.body as string)
      requested = body.legacyId
      return playerId.safeParse(requested).success ? Response.json({ id: requested }) : new Response("Invalid player", { status: 400 })
    }),
  )
  const id = await loadPlayerId()
  expect(playerId.safeParse(id).success).toBe(true)
  expect(id).toBe(requested)
  if (playerId.safeParse(stored).success) expect(id).toBe(stored)
  else expect(id).not.toBe(stored)
  expect(values.get("durable-fantasy/player")).toBe(id)
})
