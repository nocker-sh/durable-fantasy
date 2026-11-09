import { expect, it } from "vitest"
import { journeyPlayer } from "#/world/server/journey-player"
import { arrivePlayer } from "#/world/server/arrive-player"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { travelStamina } from "#/world/server/map-room/travel-stamina"
import { MAPS, OPEN_FIELDS } from "#/world/maps"
import { isOpen } from "#/world/maps/is-open"
import { leadsTowardTown } from "#/world/maps/leads-toward-town"
import type { PlayerRecord } from "#/world/server/player-record"

const fixture = (stamina: number): PlayerRecord => {
  const record = initialPlayerRecord()
  record.player = { ...record.player, stamina }
  record.location = { world: 1, map: "phanthiet", route: [[38, 80]], since: 1000, connection: "connection" }
  return record
}

const outThere = (map: string, stamina: number): PlayerRecord => {
  const record = fixture(stamina),
    spawn = MAPS[map].spawn
  record.location = { world: 1, map, route: [[spawn[0], spawn[1]]], since: 1000, connection: "connection" }
  return record
}

/** Through the way from where the record stands to `map`, then in at the far side as a fresh connection. */
const road = (record: PlayerRecord, map: string, now: number) => {
  const location = record.location
  const warp = location && MAPS[location.map].warps.find((candidate) => candidate.to.map === map)
  if (!location?.connection || !warp) throw new Error(`no way to ${map}`)
  const journey = journeyPlayer(record, { connection: location.connection, map, at: [warp.to.at[0], warp.to.at[1]], tire: travelStamina(map) }, now)
  if (journey.ok) expect(arrivePlayer(record, { world: 1, map, connection: `into ${map}` }, now).accepted).toBe(true)
  return journey
}

it("saves the road's tiredness together with the destination", () => {
  const record = fixture(50)
  expect(journeyPlayer(record, { connection: "connection", map: "south-meadow", at: [10, 10], tire: 4 }, 2000)).toEqual({ ok: true })
  expect(record.player.stamina).toBe(44)
  expect(record.location).toMatchObject({ map: "south-meadow", route: [[10, 10]] })
})

it("leaves both stamina and place alone when the road is refused", () => {
  const record = fixture(3),
    before = structuredClone(record)
  expect(journeyPlayer(record, { connection: "connection", map: "south-meadow", at: [10, 10], tire: 4 }, 2000)).toEqual({ ok: false, reason: "EXHAUSTED" })
  expect(record).toEqual(before)
})

it("does not tire a connection that does not hold the player", () => {
  const record = fixture(50),
    before = structuredClone(record)
  expect(journeyPlayer(record, { connection: "other", map: "south-meadow", at: [10, 10], tire: 4 }, 2000)).toEqual({ ok: false })
  expect(record).toEqual(before)
})

it("takes what stamina is left on a road nearer town instead of refusing it", () => {
  const record = outThere("forest-edge", 3)
  expect(road(record, "south-meadow", 2000)).toEqual({ ok: true })
  expect(record.player.stamina).toBe(0)
  expect(record.location?.map).toBe("south-meadow")
})

it("still refuses a road further out when too little is left", () => {
  const record = outThere("deep-forest", 0),
    before = structuredClone(record)
  expect(road(record, "quynhon-gate", 2000)).toEqual({ ok: false, reason: "EXHAUSTED" })
  expect(record).toEqual(before)
})

it.each([
  { from: "deep-forest", roads: ["forest-edge", "south-meadow", "phanthiet-gate"] },
  { from: "red-dunes", roads: ["south-meadow", "phanthiet-gate"] },
])("walks home from $from to the town gate with no stamina left", (trip) => {
  const record = outThere(trip.from, 0)
  for (const map of trip.roads) expect(road(record, map, 2000), map).toEqual({ ok: true })
  expect(record.location?.map).toBe("phanthiet-gate")
  expect(record.player.stamina).toBe(0)
})

it.each(OPEN_FIELDS)("reaches town from %s with no stamina left, by roads nearer town", (from) => {
  const record = outThere(from, 0)
  for (let steps = 0; record.location && MAPS[record.location.map].kind !== "town"; steps++) {
    const here = record.location.map
    const next = MAPS[here].warps.find((warp) => isOpen(warp.to.map) && leadsTowardTown(here, warp.to.map))
    if (!next || steps > OPEN_FIELDS.length) throw new Error(`stuck in ${here}`)
    expect(road(record, next.to.map, 2000), `${here} -> ${next.to.map}`).toEqual({ ok: true })
  }
  expect(record.location && MAPS[record.location.map].kind).toBe("town")
})
