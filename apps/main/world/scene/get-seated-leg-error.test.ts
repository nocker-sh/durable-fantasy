import { expect, it } from "vitest"
import { getSeatedContacts } from "#/world/scene/get-seated-contacts"
import { getSeatedLegError } from "#/world/scene/get-seated-leg-error"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { FRAMES } from "#/world/scene/figure/animation"
import type { WorkTableSection } from "#/world/town/work-table"

const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ヴィルヘルム")]
const place = { at: [0, 0] satisfies [number, number], height: 0.358, heading: 0 }
const distantTable: WorkTableSection = { part: "top", x0: 10, x1: 11, z0: 10, z1: 11, y0: 0.6, y1: 0.64 }

it("keeps both native shoes supported and rejects non-finite table geometry", () => {
  const contacts = getSeatedContacts({ look, place, frame: 0 })
  if (contacts instanceof Error) throw contacts
  expect(getSeatedLegError({ contacts, table: [distantTable], floor: 0 })).toBeNull()
  expect(getSeatedLegError({ contacts, table: [{ ...distantTable, x0: NaN }], floor: 0 })).toEqual(new Error("Invalid seated table section"))
  contacts.shoes[0].radius = NaN
  expect(getSeatedLegError({ contacts, table: [distantTable], floor: 0 })).toEqual(new Error("Invalid native seated leg geometry"))
})
it("rejects furniture through the actual shoe or clothed knee", () => {
  const contacts = getSeatedContacts({ look, place, frame: 0 })
  if (contacts instanceof Error) throw contacts
  for (const part of [
    { center: contacts.shoes[0].b, name: "shoe" },
    { center: contacts.knees[0].center, name: "knee" },
  ]) {
    const section: WorkTableSection = {
      part: "leg",
      x0: part.center[0] - 0.01,
      x1: part.center[0] + 0.01,
      y0: part.center[1] - 0.01,
      y1: part.center[1] + 0.01,
      z0: part.center[2] - 0.01,
      z1: part.center[2] + 0.01,
    }
    expect(getSeatedLegError({ contacts, table: [section], floor: 0 })).toEqual(new Error(`Seated ${part.name} intersects the table`))
  }
})
it("rejects unsupported shoes and frames outside the rendered sitting clip", () => {
  const contacts = getSeatedContacts({ look, place: { ...place, height: 0.5 }, frame: 0 })
  if (contacts instanceof Error) throw contacts
  expect(getSeatedLegError({ contacts, table: [distantTable], floor: 0 })).toEqual(new Error("Seated shoe does not meet its support plane"))
  for (const frame of [-1, FRAMES.sit, 0.5, NaN]) expect(getSeatedContacts({ look, place, frame })).toBeInstanceOf(Error)
})
