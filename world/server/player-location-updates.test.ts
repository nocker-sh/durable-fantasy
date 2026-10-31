import { expect, it } from "vitest"
import { arrivePlayer } from "#/world/server/arrive-player"
import { walkPlayer } from "#/world/server/walk-player"
import { travelPlayer } from "#/world/server/travel-player"
import { leavePlayer } from "#/world/server/leave-player"
import { revivePlayerAtHome } from "#/world/server/revive-player-at-home"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { locationAt } from "#/world/core/location-at"
import { TOWN_SPAWN } from "#/world/core/player-rules"
import type { PlayerRecord } from "#/world/server/player-record"
import type { Cell } from "#/world/protocol"

const fixture = (): PlayerRecord => ({
  ...initialPlayerRecord(),
  location: {
    world: 2,
    map: "south-meadow",
    route: [
      [10, 10],
      [11, 10],
      [12, 10],
      [13, 10],
    ],
    since: 1000,
    connection: "connection",
  },
})
it("reconnects at completed progress without jumping to the submitted route endpoint", () => {
  const record = fixture(),
    player = record.player
  expect(arrivePlayer(record, { world: 2, map: "south-meadow", connection: "replacement" }, 1250)).toEqual({ map: "south-meadow", at: [11, 10], accepted: true })
  expect(record.location).toEqual({ world: 2, map: "south-meadow", route: [[11, 10]], since: 1250, connection: "replacement" })
  expect(record.player).toBe(player)
})
it("redirects a mismatched map without changing the saved route or owner", () => {
  const record = fixture(),
    before = structuredClone(record)
  expect(arrivePlayer(record, { world: 2, map: "phanthiet", connection: "replacement" }, 1250)).toEqual({ map: "south-meadow", at: [11, 10], accepted: false })
  expect(record).toEqual(before)
})
it("does not commit a different world's town fallback until that map is accepted", () => {
  const record = fixture(),
    before = structuredClone(record)
  expect(arrivePlayer(record, { world: 3, map: "south-meadow", connection: "replacement" }, 1250)).toEqual({ map: TOWN_SPAWN.map, at: TOWN_SPAWN.cell, accepted: false })
  expect(record).toEqual(before)
  expect(arrivePlayer(record, { world: 3, map: TOWN_SPAWN.map, connection: "replacement" }, 1300).accepted).toBe(true)
  expect(record.location).toEqual({ world: 3, map: TOWN_SPAWN.map, route: [TOWN_SPAWN.cell], since: 1300, connection: "replacement" })
})
it("starts a legacy record with no location in the requested world's town", () => {
  const record = initialPlayerRecord()
  expect(arrivePlayer(record, { world: 4, map: TOWN_SPAWN.map, connection: "connection" }, 1250).accepted).toBe(true)
  expect(record.location).toMatchObject({ world: 4, route: [TOWN_SPAWN.cell], since: 1250, connection: "connection" })
})
it.each(["missing", "owner", "fallen"])("refuses walking and travel for %s authority without mutating state", (invalid) => {
  const record = fixture()
  if (invalid === "missing") record.location = null
  if (invalid === "fallen") record.player = { ...record.player, hp: 0 }
  const connection = invalid === "owner" ? "other" : "connection",
    before = structuredClone(record)
  expect(
    walkPlayer(
      record,
      {
        connection,
        route: [
          [10, 10],
          [11, 10],
        ],
      },
      1250,
    ),
  ).toBe(false)
  expect(travelPlayer(record, { connection, map: "phanthiet", at: [38, 80] }, 1250)).toBe(false)
  expect(record).toEqual(before)
})
it.each([
  { since: undefined, expected: 1250 },
  { since: 0, expected: 0 },
  { since: 1200, expected: 1200 },
])("preserves the received route timestamp $since", (input) => {
  const record = fixture(),
    route: Cell[] = [
      [11, 10],
      [12, 10],
    ]
  expect(walkPlayer(record, { connection: "connection", route, since: input.since }, 1250)).toBe(true)
  expect(record.location).toEqual({ world: 2, map: "south-meadow", route, since: input.expected, connection: "connection" })
})
it("commits travel before allowing a replacement connection to move", () => {
  const record = fixture()
  expect(travelPlayer(record, { connection: "connection", map: TOWN_SPAWN.map, at: [38, 80] }, 1250)).toBe(true)
  expect(record.location).toEqual({ world: 2, map: TOWN_SPAWN.map, route: [[38, 80]], since: 1250, connection: null })
  expect(
    walkPlayer(
      record,
      {
        connection: "connection",
        route: [
          [38, 80],
          [39, 80],
        ],
      },
      1300,
    ),
  ).toBe(false)
  expect(arrivePlayer(record, { world: 2, map: TOWN_SPAWN.map, connection: "replacement" }, 1350).accepted).toBe(true)
  expect(
    walkPlayer(
      record,
      {
        connection: "replacement",
        route: [
          [38, 80],
          [39, 80],
        ],
      },
      1400,
    ),
  ).toBe(true)
})
it("freezes completed progress and its timestamp together on disconnect", () => {
  const record = fixture()
  leavePlayer(record, "connection", 1250)
  expect(record.location).toEqual({ world: 2, map: "south-meadow", route: [[11, 10]], since: 1250, connection: null })
  if (!record.location) throw new Error("Missing frozen location")
  expect(locationAt(record.location, 10000)).toEqual([11, 10])
})
it("does not let a stale disconnect freeze a replacement connection", () => {
  const record = fixture()
  arrivePlayer(record, { world: 2, map: "south-meadow", connection: "replacement" }, 1250)
  const before = structuredClone(record)
  leavePlayer(record, "connection", 1500)
  expect(record).toEqual(before)
})
it("keeps a revived mutable route independent from the immutable home cell", () => {
  const record = fixture()
  record.player = { ...record.player, hp: 0 }
  const home = [...record.player.savePoint.cell]
  const result = revivePlayerAtHome(record, "connection", 1250)
  expect(result.ok).toBe(true)
  if (!record.location) throw new Error("Missing revived location")
  expect(record.location.since).toBe(1250)
  expect(record.location.route[0]).toEqual(home)
  record.location.route[0][0] += 1
  expect(record.player.savePoint.cell).toEqual(home)
})
