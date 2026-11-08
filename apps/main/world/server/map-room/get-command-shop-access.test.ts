import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { getCommandShopAccess } from "#/world/server/map-room/get-command-shop-access"
import { MAPS } from "#/world/maps"
import { player } from "#/world/test/player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Cell } from "#/world/maps/types"

const policy = vi.hoisted(() => ({
  open: true,
  cells: new Map<string, readonly [number, number]>(),
  near: vi.fn((_me: unknown, _cell: readonly [number, number], _distance: number) => true),
  opening: vi.fn(() => true),
}))
vi.mock("#/world/maps/npc-cell", () => ({ npcCell: (_map: unknown, name: string) => policy.cells.get(name) ?? null }))
vi.mock("#/world/maps/shop-open", () => ({ shopOpen: () => policy.opening() }))
vi.mock("#/world/server/map-room/near", () => ({ near: (me: unknown, cell: Cell, distance: number) => policy.near(me, cell, distance) }))

const presence: Presence = { owner: "owner", player: mapPlayer("connection", player(), [0, 0]), route: [[0, 0]], since: 0, said: [], engaged: null, held: 540 }
const context = { map: MAPS.phanthiet, me: presence }
const command = { type: "buy", shop: "bakery", item: "rye-bread", count: 1 } satisfies Parameters<typeof getCommandShopAccess>[1]

beforeEach(() => {
  policy.cells.clear()
  policy.open = true
  policy.near.mockReturnValue(true)
  policy.opening.mockImplementation(() => policy.open)
})
afterEach(() => vi.clearAllMocks())

it("does not inspect counters for a player-local command", () => {
  expect(getCommandShopAccess(context, { type: "sit" })).toEqual({ ok: true, keepers: null })
  expect(policy.opening).not.toHaveBeenCalled()
  expect(policy.near).not.toHaveBeenCalled()
})

it("returns only the keepers present at the counter", () => {
  policy.cells.set("マルタ", [0, 0])
  expect(getCommandShopAccess(context, command)).toEqual({ ok: true, keepers: ["マルタ"] })
  expect(policy.near).toHaveBeenCalledOnce()
})

it("rejects a closed shop before testing distance", () => {
  policy.open = false
  policy.cells.set("マルタ", [100, 100])
  expect(getCommandShopAccess(context, command)).toEqual({ ok: false, reason: "CLOSED" })
  expect(policy.near).not.toHaveBeenCalled()
})

it("rejects an absent or unreachable counter", () => {
  expect(getCommandShopAccess(context, command)).toEqual({ ok: false, reason: "TOO_FAR" })
  policy.cells.set("マルタ", [100, 100])
  policy.near.mockReturnValue(false)
  expect(getCommandShopAccess(context, command)).toEqual({ ok: false, reason: "TOO_FAR" })
})
