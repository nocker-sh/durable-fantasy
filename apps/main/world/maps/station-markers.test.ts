import { expect, it } from "vitest"
import { STATIONS } from "#/world/town/stations"
import { INTERIORS } from "#/world/town/interiors"
import { stationMarkers } from "#/world/maps/station-markers"

it("marks every shared station where it stands", () => {
  for (const station of STATIONS) expect(stationMarkers(station.map).some((marker) => marker.cell[0] === station.cell[0] && marker.cell[1] === station.cell[1])).toBe(true)
})

it("marks an indoor station's building on the street too, so it can be found from outside", () => {
  const indoor = STATIONS.find((station) => INTERIORS.some((interior) => interior.id === station.map))!
  const house = INTERIORS.find((interior) => interior.id === indoor.map)!.house
  expect(stationMarkers(house.map).length).toBeGreaterThan(0)
})
