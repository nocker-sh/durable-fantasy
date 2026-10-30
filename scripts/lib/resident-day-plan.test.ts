import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import { getResidentProposalError } from "#/scripts/lib/get-resident-proposal-error"
import { getResidentDayBudget } from "#/world/town/get-resident-day-budget"
import { getResidentDayTransition } from "#/world/town/get-resident-day-transition"

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
  const resident = documents.get("resident-ルードヴィヒ")
  if (!resident) throw new Error("Missing resident")
  const proposal = residentProposalSchema.parse(resident.resident_proposal),
    day = proposal.day_plan
  if (!day) throw new Error("Missing authored day")
  resident.resident_proposal = proposal
  return { resident, documents, proposal, day }
}

it("binds the authored full-day reservation to the household and local supply districts", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents])
  expect(getResidentProposalError(source)).toBeNull()
  expect(getResidentDayBudget(source.day)).toMatchObject({ totalMinutes: 1440, minutesByActivity: { sleep: 480, work: 370, rest: 165 } })
  expect(JSON.stringify([...source.documents])).toBe(before)
  expect(source.resident.design_gate).toBe("未通過")
  expect(source.day.status).toBe("proposed")
  expect(source.day.pending.length).toBeGreaterThan(0)
})

it("rejects unresolved places across consistent travel and stay declarations", () => {
  const source = fixture(),
    segment = source.day.segments[1]
  if (segment.kind !== "travel") throw new Error("Missing travel")
  segment.to = { kind: "room", room: "missing" }
  const next = source.day.segments[2]
  if (next.kind !== "stay") throw new Error("Missing stay")
  next.place = segment.to
  const onward = source.day.segments[3]
  if (onward.kind !== "travel") throw new Error("Missing onward travel")
  onward.from = segment.to
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed day references an unresolved room"))
})

it("rejects wrong room kinds, towns, occupants, building allocations and private access", () => {
  for (const mutation of [{ kind: "facilities" }, { town: "town-other" }, { occupants: [] }, { private_for: ["resident-other"] }, { building: "missing" }, { map: "map-other" }]) {
    const source = fixture(),
      room = source.documents.get("room-hue-ludwig-toilet")
    if (!room) throw new Error("Missing toilet")
    Object.assign(room, mutation)
    expect(getResidentProposalError(source)).toBeInstanceOf(Error)
  }
})

it("rejects missing and unrelated supply districts and mismatched workplaces", () => {
  for (const symbol of ["Z", "H", "F"]) {
    const source = fixture()
    for (const segment of source.day.segments) {
      const transition = getResidentDayTransition(segment)
      for (const place of [transition.from, transition.to]) if (place.kind === "district" && place.symbol === "P") place.symbol = symbol
    }
    expect(getResidentProposalError(source)).toBeInstanceOf(Error)
  }
  const source = fixture()
  source.proposal.work_district = "J"
  source.proposal.work_district_role = "housing"
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed day works outside its declared workplace"))
})

it("requires personal sleep and potable storage rather than any available room", () => {
  const source = fixture(),
    segment = source.day.segments.find((candidate) => candidate.kind === "stay" && candidate.activity === "hygiene")
  if (!segment || segment.kind !== "stay") throw new Error("Missing hygiene")
  segment.activity = "sleep"
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed day does not sleep in the personal bedroom"))
  segment.activity = "water"
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed day stores drinking water without potable storage"))
})

it("does not let a full arithmetic budget omit essential daily activities", () => {
  const activities = ["sleep", "meal", "water", "hygiene", "work", "rest"]
  for (const activity of activities) {
    const source = fixture()
    for (const segment of source.day.segments) if (segment.kind === "stay" && segment.activity === activity) segment.activity = "clean"
    expect(getResidentProposalError(source)).toEqual(new Error(`Proposed workday reserves no ${activity} time`))
  }
})

it("checks districts used solely while travelling and food collection at its actual destination", () => {
  const source = fixture(),
    journey = source.day.segments[1]
  if (journey.kind !== "travel") throw new Error("Missing journey")
  source.day.segments.splice(
    1,
    1,
    { ...journey, to_min: journey.from_min + 2, to: { kind: "district", symbol: "Z" } },
    { ...journey, from_min: journey.from_min + 2, from: { kind: "district", symbol: "Z" } },
  )
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed day references an unresolved district"))
  const collection = fixture()
  for (const segment of collection.day.segments) {
    const transition = getResidentDayTransition(segment)
    for (const place of [transition.from, transition.to]) if (place.kind === "district" && place.symbol === "F") place.symbol = "H"
  }
  expect(getResidentProposalError(collection)).toEqual(new Error("Proposed day collects supplies from an unrelated district"))
})
