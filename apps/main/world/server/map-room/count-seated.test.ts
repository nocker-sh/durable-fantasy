import { expect, it, vi } from "vitest"
import { countSeated } from "#/world/server/map-room/count-seated"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))

const someone = { id: "p", name: "ロート", x: 0, z: 0 }
const connection = (id: string, state: object | undefined) => ({ id, state }) as Parameters<typeof countSeated>[0] extends Iterable<infer C> ? C : never

it("counts those in the room and those joining, not the one asking nor a closing socket", () => {
  const connections = [
    connection("in", { player: someone }),
    connection("joining", { player: null, joining: true }),
    connection("closing", { player: someone, closed: true }),
    connection("idle", undefined),
    connection("me", { player: null, joining: true }),
  ]
  expect(countSeated(connections, "me")).toBe(2)
})
