import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
import { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import { getDishwaterCaptureError } from "#/scripts/lib/get-dishwater-capture-error"
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
  const room = documents.get("room-hue-ludwig-1"),
    resident = documents.get("resident-ルードヴィヒ")
  if (!room || !resident) throw new Error("Missing household")
  const capture = dishwaterCaptureSchema.parse(room.dishwater_capture)
  room.dishwater_capture = capture
  return { documents, room, resident, capture }
}

it("binds all three workday cleanups to dedicated owned equipment without modifying the proposal", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents])
  expect(getDishwaterCaptureError(source)).toBeNull()
  expect(JSON.stringify([...source.documents])).toBe(before)
  expect(source.capture.final_disposal).toBeNull()
  expect(source.room.design_gate).toBe("未通過")
})

it("does not reuse potable storage, toilet waste or dirty laundry equipment for dishwater", () => {
  for (const symbol of ["V", "A", "R"]) {
    const source = fixture()
    source.capture.effluent_symbol = symbol
    expect(getDishwaterCaptureError(source)).toEqual(new Error("Dishwater capture mixes fresh water and dirty equipment"))
  }
  for (const role of ["potable_water_storage", "toilet_waste_holding", "clothes_washing"]) {
    const source = fixture(),
      receiver = source.room.furniture?.find((piece) => piece.symbol === "X")
    if (!receiver) throw new Error("Missing receiver")
    receiver.role = role
    expect(getDishwaterCaptureError(source)).toEqual(new Error("Liquid vessel has no matching furniture role and grid"))
  }
})

it("reserves a clean drying place instead of returning wet dishes directly to storage", () => {
  const source = fixture(),
    drying = source.room.furniture?.find((piece) => piece.symbol === "R")
  if (!drying) throw new Error("Missing drying place")
  drying.role = "storage"
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Dishwater capture has no separate clean drying place"))
})

it("checks the usable cavity, headroom, displacement and complete outer footprint", () => {
  const source = fixture()
  source.capture.wash_ml = 16145
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Reserved wash exceeds basin working capacity"))
  source.capture.wash_ml = 3000
  source.capture.receiver.inner_mm[1] = 100
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Reserved dishwater exceeds retained effluent capacity"))
  source.capture.receiver.inner_mm[0] = 470
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Liquid vessel walls exceed their furniture footprint"))
  source.capture.receiver.inner_mm = [360, 300, 360]
  source.capture.receiver.freeboard_mm = 300
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Liquid vessel has no bounded working cavity"))
})

it("counts a pre-existing effluent load and rejects unreserved later cleanups", () => {
  const source = fixture()
  source.capture.initial_effluent_ml = 25000
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Reserved dishwater exceeds retained effluent capacity"))
  source.capture.initial_effluent_ml = 0
  const proposal = residentProposalSchema.parse(source.resident.resident_proposal),
    cleanup = proposal.day_plan?.segments.find((segment) => segment.kind === "stay" && segment.activity === "cleanup")
  if (!cleanup || cleanup.kind !== "stay") throw new Error("Missing cleanup")
  cleanup.activity = "rest"
  source.resident.resident_proposal = proposal
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Dishwater reservation does not match the workday cleanups"))
})

it("requires the correct owner, maintainer and a coherent workday in the same home", () => {
  for (const mutation of [{ owner: "別人" }, { maintainers: [] }]) {
    const source = fixture(),
      basin = source.room.furniture?.find((piece) => piece.symbol === "A")
    if (!basin) throw new Error("Missing basin")
    Object.assign(basin, mutation)
    expect(getDishwaterCaptureError(source)).toEqual(new Error("Dishwater equipment has no matching owner and maintainer"))
  }
  const source = fixture()
  source.capture.operator = "missing"
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Dishwater capture has no matching proposed workday"))
})

it("does not invent an outlet or clear the design gate while disposal and handling remain unresolved", () => {
  const source = fixture()
  source.room.design_gate = "通過"
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Proposed dishwater retention cannot clear the design gate"))
  source.room.design_gate = "未通過"
  source.room.dishwater_capture = { ...source.capture, final_disposal: "street" }
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Invalid dishwater capture proposal"))
  source.room.dishwater_capture = { ...source.capture, pending: [] }
  expect(getDishwaterCaptureError(source)).toEqual(new Error("Invalid dishwater capture proposal"))
})
