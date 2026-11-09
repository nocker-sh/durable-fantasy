import { expect, it } from "vitest"
import { arrivePlayer } from "#/world/server/arrive-player"
import { player } from "#/world/test/player"
import type { PlayerLocation } from "#/world/core/location-types"

const wild = (world: number): PlayerLocation => ({ world, map: "phanthiet-meadow", route: [[20, 20]], since: 0, connection: null })

it("carries a player left in the wild of a town no longer given out to the same place at home", () => {
  const record = { location: wild(5), player: player() }
  expect(arrivePlayer(record, { world: 1, map: "phanthiet-meadow", connection: "c" }, 1000)).toEqual({ map: "phanthiet-meadow", at: [20, 20], accepted: true })
  expect(record.location?.world).toBe(1)
})

it("still keeps a thread holder in the wild of the town they followed it to", () => {
  const record = { location: wild(5), player: player({ threads: [{ key: "k", name: "Hans", town: 5, at: 0 }] }) }
  expect(arrivePlayer(record, { world: 1, map: "phanthiet", connection: "c" }, 1000)).toMatchObject({ world: 5, accepted: false })
})
