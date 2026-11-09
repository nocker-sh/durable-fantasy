import { afterEach, expect, it, vi } from "vitest"
import { cellsReached } from "#/world/cells-reached"
import { CELLS_PER_SECOND, MOVE_LEAD_MS } from "#/world/protocol"
import type { Ctx } from "#/world/server/map-room/context"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import { player } from "#/world/test/player"
import type { Cell, ServerMessage } from "#/world/protocol"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const walk = vi.hoisted(() => vi.fn(async () => true))
vi.mock("../../../durable-objects/player", () => ({ Player: { get: () => ({ walk }) } }))
vi.mock("#/world/maps/walkable", () => ({
  walkable: (_map: unknown, cell: Cell) => cell.every((n) => n >= 0 && n < 96),
}))
import { HANDLERS } from "#/world/server/map-room/moving"
afterEach(() => {
  vi.useRealTimers()
  walk.mockClear()
})

const step = 1000 / CELLS_PER_SECOND

/** One connection on an open map, moved by the real handler; time is the room's receipt time. */
function walker(start: number) {
  vi.useFakeTimers()
  vi.setSystemTime(start)
  const refused: ServerMessage[] = []
  const room: { state: Presence } = { state: { owner: "owner", player: mapPlayer("connection", player(), [5, 10]), route: [[5, 10]], since: start, said: [], engaged: null } }
  const move = async (path: Cell[], receivedAt: number) => {
    vi.setSystemTime(receivedAt)
    const context = {
      ctx: {
        connection: {
          id: "connection",
          send: async (message: ServerMessage) => {
            refused.push(message)
          },
        },
        room: { broadcast: async () => {} },
      },
      map: {},
      me: room.state,
      receivedAt,
      save: (patch: Partial<Presence>) => {
        room.state = { ...room.state, ...patch }
      },
      standUp: async () => true,
    } as unknown as Ctx
    await HANDLERS.move!(context, { type: "move", path })
  }
  /** A two-cell path from just beyond the furthest cell the room allows now. */
  const greedy = (now: number): Cell[] => {
    const front = cellsReached(room.state.route, Math.max(0, now - room.state.since) / 1000).at(-1)!
    return [
      [Math.min(95, front[0] + 1), 10],
      [Math.min(95, front[0] + 2), 10],
    ]
  }
  return { room, refused, move, greedy }
}

it("does not let a burst of moves in one instant carry the player further than the lead", async () => {
  const w = walker(10_000)
  for (let i = 0; i < 40; i++) await w.move(w.greedy(10_000), 10_000)
  const lead = (MOVE_LEAD_MS / 1000) * CELLS_PER_SECOND
  expect(w.room.state.route[0][0] - 5).toBeLessThanOrEqual(lead)
  expect(cellsReached(w.room.state.route, 0).at(-1)![0] - 5).toBeLessThanOrEqual(lead + 1)
  expect(w.refused.some((message) => message.type === "refused" && message.what === "move")).toBe(true)
})

it("keeps a client sending moves as fast as it likes to walking speed plus the lead", async () => {
  const w = walker(10_000)
  for (let at = 10_000; at <= 15_000; at += 20) await w.move(w.greedy(at), at)
  const allowed = (5 + MOVE_LEAD_MS / 1000) * CELLS_PER_SECOND
  expect(w.room.state.route[0][0] - 5).toBeLessThanOrEqual(allowed)
  // it still walks: refusing it does not freeze an ordinary pace
  expect(w.room.state.route[0][0] - 5).toBeGreaterThan(5 * CELLS_PER_SECOND - 2)
})

it("accepts held-key walking whose messages come late and then bunched behind a delayed one", async () => {
  const w = walker(0)
  const cell = (index: number): Cell => [5 + index, 10]
  const delay = (index: number) => (index === 10 ? 900 : 100)
  const received = { last: 0 }
  for (let index = 0; index < 60; index++) {
    // the screen sends the next step one frame after the first, then one step each time it reaches a cell
    const sent = index === 0 ? 0 : index === 1 ? 16 : (index - 1) * step
    received.last = Math.max(received.last, sent + delay(index))
    await w.move([cell(index), cell(index + 1)], received.last)
  }
  expect(w.refused).toEqual([])
  expect(w.room.state.route).toEqual([cell(59), cell(60)])
})
