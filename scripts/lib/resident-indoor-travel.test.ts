import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import { getResidentProposalError } from "#/scripts/lib/get-resident-proposal-error"
import { getResidentDayBudget } from "#/world/town/get-resident-day-budget"
import { getProposedRoomRouteError } from "#/scripts/lib/get-proposed-room-route-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"

const fixture = () => {
  const paths = [
    "residents/resident-ルードヴィヒ",
    "towns/town-hue",
    "maps/map-hue-quarter",
    "buildings/building-hue-ludwig",
    ...["1", "2", "hall", "wash", "toilet", "fuel"].map((room) => `rooms/room-hue-ludwig-${room}`),
  ]
  const documents = new Map(
    paths.map((path) => {
      const document = readSetting(readFileSync(`.docs/settings/${path}.md`, "utf8"))
      return [document.id, document]
    }),
  )
  const resident = documents.get("resident-ルードヴィヒ"),
    hall = documents.get("room-hue-ludwig-hall"),
    building = documents.get("building-hue-ludwig")
  if (!resident || !hall || !building) throw new Error("Missing household")
  const proposal = residentProposalSchema.parse(resident.resident_proposal),
    day = proposal.day_plan
  if (!day) throw new Error("Missing day")
  resident.resident_proposal = proposal
  const segment = day.segments[1]
  if (segment.kind !== "travel") throw new Error("Missing first journey")
  return { resident, documents, proposal, day, segment, hall, building }
}

it("authors every indoor journey through the actual hall, including entering and leaving the house", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents])
  expect(getResidentProposalError(source)).toBeNull()
  expect(source.segment.room_route).toEqual(["room-hue-ludwig-2", "room-hue-ludwig-hall", "room-hue-ludwig-toilet"])
  for (const segment of source.day.segments) if (segment.kind === "travel" && (segment.from.kind === "room" || segment.to.kind === "room")) expect(segment.room_route).toContain(source.hall.id)
  expect(JSON.stringify([...source.documents])).toBe(before)
})

it("refuses the former wall-crossing shortcut despite a complete time and endpoint budget", () => {
  const source = fixture()
  source.segment.room_route = ["room-hue-ludwig-2", "room-hue-ludwig-toilet"]
  expect(getResidentDayBudget(source.day)).not.toBeInstanceOf(Error)
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed indoor travel skips a room connection"))
})

it("requires a nonempty authored route whose first and last rooms are the reserved endpoints", () => {
  const source = fixture()
  delete source.segment.room_route
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed room travel has no authored indoor route"))
  source.segment.room_route = []
  expect(getResidentProposalError(source)).toEqual(new Error("Invalid proposed resident or unplaced town study"))
  for (const route of [
    ["room-hue-ludwig-hall", "room-hue-ludwig-toilet"],
    ["room-hue-ludwig-toilet", "room-hue-ludwig-hall", "room-hue-ludwig-2"],
  ]) {
    source.segment.room_route = route
    expect(getResidentProposalError(source)).toEqual(new Error("Proposed indoor travel does not meet its endpoint rooms"))
  }
})

it("checks ownership, privacy and map allocation for intermediate rooms, not only the endpoints", () => {
  for (const mutation of [{ occupants: [] }, { private_for: ["resident-other"] }, { town: "town-other" }, { map: "map-other" }, { kind: "facilities" }]) {
    const source = fixture()
    Object.assign(source.hall, mutation)
    expect(getResidentProposalError(source)).toBeInstanceOf(Error)
  }
  const source = fixture()
  source.documents.delete(source.hall.id)
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed indoor travel references an unresolved room"))
})

it("does not substitute graph edges for reciprocal, aligned doors in the authored building", () => {
  const source = fixture()
  source.hall.connections = []
  expect(getResidentProposalError(source)?.message).toContain("invalid building layout")
  const unplaced = fixture()
  delete unplaced.building.layout
  expect(getResidentProposalError(unplaced)).toEqual(new Error("Proposed indoor travel has no authored building layout"))
  const shifted = fixture()
  shifted.hall.origin = [1, 6]
  expect(getResidentProposalError(shifted)?.message).toContain("invalid building layout")
})

it("enters and exits through a room with an actual door to the building's map", () => {
  const source = fixture(),
    departure = source.day.segments.find((segment) => segment.kind === "travel" && segment.from.kind === "room" && segment.to.kind === "district")
  if (!departure || departure.kind !== "travel" || departure.from.kind !== "room") throw new Error("Missing departure")
  departure.room_route = [departure.from.room]
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed indoor travel has no declared outdoor doorway"))
  const arrivalSource = fixture(),
    arrival = arrivalSource.day.segments.find((segment) => segment.kind === "travel" && segment.from.kind === "district" && segment.to.kind === "room")
  if (!arrival || arrival.kind !== "travel" || arrival.to.kind !== "room") throw new Error("Missing arrival")
  arrival.room_route = [arrival.to.room]
  expect(getResidentProposalError(arrivalSource)).toEqual(new Error("Proposed indoor travel has no declared outdoor doorway"))
})

it("does not invent an indoor endpoint for a district-only journey", () => {
  const source = fixture(),
    segment = source.day.segments.find((candidate) => candidate.kind === "travel" && candidate.from.kind === "district" && candidate.to.kind === "district")
  if (!segment || segment.kind !== "travel") throw new Error("Missing outdoor journey")
  segment.room_route = [source.hall.id]
  expect(getResidentProposalError(source)).toEqual(new Error("District-only travel cannot declare an indoor endpoint route"))
})

it("does not cross into another authorized building without reserving an outdoor journey", () => {
  const source = fixture(),
    other = { ...source.building, id: "building-other", rooms: [source.hall.id] }
  source.hall.building = other.id
  source.documents.set(other.id, other)
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed indoor travel crosses buildings without going outdoors"))
})

it("reserves handwashing after ash and laundry before collecting water or preparing food", () => {
  const source = fixture()
  for (const activity of ["fuel_ash", "laundry"]) {
    const index = source.day.segments.findIndex((segment) => segment.kind === "stay" && segment.activity === activity)
    const washing = source.day.segments[index + 2]
    expect(washing).toMatchObject({ kind: "stay", activity: "hygiene", place: { kind: "room", room: "room-hue-ludwig-toilet" } })
    expect(washing.to_min - washing.from_min).toBeGreaterThan(0)
    expect(source.day.segments[index + 1].kind).toBe("travel")
    expect(source.day.segments[index + 3].kind).toBe("travel")
    if (activity === "fuel_ash") expect(source.day.segments[index + 4]).toMatchObject({ kind: "stay", activity: "water" })
    if (activity === "laundry") expect(source.day.segments[index + 4]).toMatchObject({ kind: "stay", activity: "prepare_food" })
  }
  expect(getResidentDayBudget(source.day)).toMatchObject({ totalMinutes: 1440, minutesByActivity: { sleep: 480, work: 370, rest: 165 } })
})

it("uses an authored staircase on adjacent floors rather than requiring every itinerary to stay on one floor", () => {
  const resident: SettingDocument = { id: "resident-test", kind: "residents", title: "住人", source: "test", status: "設計中", design_gate: "未通過", issues: [], town: "town-test" }
  const base: SettingDocument = { ...resident, kind: "rooms", building: "building-stair", map: "map-outside", occupants: [resident.title], floor: 0, origin: [0, 0] }
  const lower: SettingDocument = {
    ...base,
    id: "room-lower",
    grid: { cell_m: 1, rows: ["####", "#S.#", "#..D", "####"] },
    furniture: [{ symbol: "S", name: "階段", owner: "住人", source: "test", rect: [1, 1, 1, 1], access: [[2, 1]] }],
    connections: [
      { kind: "stair", furniture: "S", target: "room-upper", target_furniture: "S", access: [2, 1], target_access: [2, 1] },
      { kind: "door", door: [3, 2], target: "map-outside", width_cells: 1 },
    ],
  }
  const upper: SettingDocument = {
    ...lower,
    id: "room-upper",
    floor: 1,
    grid: { cell_m: 1, rows: ["####", "#S.#", "#..#", "####"] },
    connections: [{ kind: "stair", furniture: "S", target: lower.id, target_furniture: "S", access: [2, 1], target_access: [2, 1] }],
  }
  const building: SettingDocument = {
    ...resident,
    id: "building-stair",
    kind: "buildings",
    map: "map-outside",
    residents: [resident.id],
    rooms: [lower.id, upper.id],
    layout: {
      cell_m: 1,
      width: 4,
      depth: 4,
      floors: [
        { floor: 0, rooms: [lower.id] },
        { floor: 1, rooms: [upper.id] },
      ],
    },
  }
  const outside: SettingDocument = { ...resident, id: "map-outside", kind: "maps", map_kind: "town" },
    documents = new Map([resident, lower, upper, building, outside].map((document) => [document.id, document]))
  const segment = {
    kind: "travel",
    from_min: 0,
    to_min: 5,
    purpose: "階段を上がる",
    from: { kind: "room", room: lower.id },
    to: { kind: "room", room: upper.id },
    room_route: [lower.id, upper.id],
  } satisfies Parameters<typeof getProposedRoomRouteError>[0]["segment"]
  expect(getProposedRoomRouteError({ resident, segment, documents })).toBeNull()
  upper.origin = [1, 0]
  expect(getProposedRoomRouteError({ resident, segment, documents })?.message).toContain("invalid building layout")
})
