import { expect, it } from "vitest"
import { auditOutdoorJourney } from "#/scripts/lib/audit-outdoor-journey"
const ground = () => ({
  map_tiles: 20,
  metres_per_tile: 1,
  water: {
    points: [
      [10, 0],
      [10, 20],
    ],
    half_width: 1,
  },
  bridges: [[8, 4, 12, 6]] as [number, number, number, number][],
  obstacles: [] as { id: string; rect: [number, number, number, number] }[],
})
it("allows a full body envelope supported by the bridge", () => {
  expect(
    auditOutdoorJourney({
      points: [
        [2, 5],
        [18, 5],
      ],
      widthMetres: 1,
      ground: ground(),
    }),
  ).toEqual([])
})
it("rejects unsupported water even when another part of the journey uses a bridge", () => {
  expect(
    auditOutdoorJourney({
      points: [
        [2, 5],
        [18, 5],
        [18, 8],
        [2, 8],
      ],
      widthMetres: 1,
      ground: ground(),
    }),
  ).toContain("Journey crosses water outside a bridge")
})
it("does not accept a centre line on the bridge with the body hanging off its edge", () => {
  expect(
    auditOutdoorJourney({
      points: [
        [2, 5.8],
        [18, 5.8],
      ],
      widthMetres: 1,
      ground: ground(),
    }),
  ).toContain("Journey crosses water outside a bridge")
})
it("checks the body against land obstacles and the map edge", () => {
  const g = ground()
  g.obstacles = [{ id: "field", rect: [3, 3, 5, 5] }]
  expect(
    auditOutdoorJourney({
      points: [
        [2, 2.7],
        [6, 2.7],
      ],
      widthMetres: 1,
      ground: g,
    }),
  ).toContain("Journey crosses field")
  expect(
    auditOutdoorJourney({
      points: [
        [0.2, 1],
        [0.2, 3],
      ],
      widthMetres: 1,
      ground: g,
    }),
  ).toContain("Journey leaves its map")
})
it("only exempts the source building on the departure segment", () => {
  const g = ground()
  g.obstacles = [{ id: "home", rect: [1, 1, 4, 4] }]
  expect(
    auditOutdoorJourney({
      points: [
        [4, 2],
        [6, 2],
      ],
      widthMetres: 1,
      ground: g,
      sourceId: "home",
    }),
  ).toEqual([])
  expect(
    auditOutdoorJourney({
      points: [
        [4, 2],
        [6, 2],
        [6, 3],
        [2, 3],
      ],
      widthMetres: 1,
      ground: g,
      sourceId: "home",
    }),
  ).toContain("Journey crosses home")
})
it("does not silently use a bounding box for diagonal or zero length routes", () => {
  expect(
    auditOutdoorJourney({
      points: [
        [2, 2],
        [3, 3],
      ],
      widthMetres: 1,
      ground: ground(),
    }),
  ).toContain("Journey needs nonzero axis-aligned segments")
  expect(
    auditOutdoorJourney({
      points: [
        [2, 2],
        [2, 2],
      ],
      widthMetres: 1,
      ground: ground(),
    }),
  ).toContain("Journey needs nonzero axis-aligned segments")
})
it("does not turn invalid bridge or river geometry into an exemption", () => {
  const g = ground()
  g.bridges = [[0, 0, NaN, 20]]
  expect(
    auditOutdoorJourney({
      points: [
        [2, 5],
        [18, 5],
      ],
      widthMetres: 1,
      ground: g,
    }),
  ).toEqual(["Invalid journey ground geometry"])
  g.bridges = []
  g.water.half_width = NaN
  expect(
    auditOutdoorJourney({
      points: [
        [2, 5],
        [18, 5],
      ],
      widthMetres: 1,
      ground: g,
    }),
  ).toEqual(["Invalid journey ground geometry"])
})
