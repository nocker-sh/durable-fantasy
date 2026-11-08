import { expect, it } from "vitest"
import { journeyPlayer } from "#/world/server/journey-player"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"

const fixture = (stamina: number): PlayerRecord => {
  const record = initialPlayerRecord()
  record.player = { ...record.player, stamina }
  record.location = { world: 1, map: "phanthiet", route: [[38, 80]], since: 1000, connection: "connection" }
  return record
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
