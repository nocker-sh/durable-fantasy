import { beforeEach, describe, expect, it, vi } from "vitest"

const credentials = vi.hoisted(() => new Map<string, string>())
vi.mock("../../durable-objects/player", () => ({
  Player: {
    get: (id: string) => ({
      authenticate: async (hash: string) => credentials.get(id) === hash,
      claim: async (hash: string) => {
        if (credentials.has(id)) return credentials.get(id) === hash
        credentials.set(id, hash)
        return true
      },
    }),
  },
}))
import { authenticatedPlayer } from "#/world/server/authenticated-player"
import { establishSession } from "#/world/server/establish-session"
import { sessionCookie } from "#/world/server/session-cookie"

const origin = "http://durable-fantasy.localhost"
const request = (cookie?: string, from = origin) => new Request(`${origin}/api/session`, { method: "POST", headers: { Origin: from, ...(cookie ? { Cookie: cookie } : {}) } })
beforeEach(() => credentials.clear())

describe("browser ownership", () => {
  it("issues an HttpOnly same-site credential and restores that owner", async () => {
    const response = await establishSession(request(), crypto.randomUUID(), "a".repeat(64))
    expect(response.status).toBe(200)
    const cookie = response.headers.get("set-cookie")!
    expect(cookie).toContain("HttpOnly; SameSite=Strict")
    expect(response.headers.get("cache-control")).toBe("no-store")
    const { id } = (await response.json()) as { id: string }
    expect(await authenticatedPlayer(request(cookie))).toBe(id)
    expect(await (await establishSession(request(cookie))).json()).toEqual({ id })
    expect(credentials.get(id)).not.toBe(sessionCookie(request(cookie))!.secret)
  })

  it("migrates a private legacy id once and refuses reuse of that id without its cookie", async () => {
    const id = crypto.randomUUID()
    const first = await establishSession(request(), id, "a".repeat(64))
    expect(await first.json()).toEqual({ id })
    expect((await establishSession(request(), id, "b".repeat(64))).status).toBe(409)
    const forged = `df-session=${id}.${"0".repeat(64)}`
    expect(await authenticatedPlayer(request(forged))).toBeNull()
    expect((await establishSession(request(forged), id)).status).toBe(401)
  })

  it("retries a lost creation response with the original proof without replacing ownership", async () => {
    const id = crypto.randomUUID()
    await establishSession(request(), id, "a".repeat(64))
    const retry = await establishSession(request(), id, "a".repeat(64))
    expect(retry.status).toBe(200)
    expect(await authenticatedPlayer(request(retry.headers.get("set-cookie")!))).toBe(id)
    expect(credentials.size).toBe(1)
    expect((await establishSession(request(), id)).status).toBe(400)
  })

  it("rejects cross-origin creation without allocating an identity", async () => {
    expect((await establishSession(request(undefined, "https://example.invalid"))).status).toBe(403)
    expect(credentials.size).toBe(0)
  })

  it("uses secure cookies on HTTPS and rejects malformed credentials", async () => {
    const response = await establishSession(new Request("https://example.invalid/api/session", { method: "POST", headers: { Origin: "https://example.invalid" } }), crypto.randomUUID(), "a".repeat(64))
    expect(response.headers.get("set-cookie")).toContain("; Secure")
    expect(sessionCookie(request("df-session=bad"))).toBeNull()
    expect(await authenticatedPlayer(request())).toBeNull()
  })
})
