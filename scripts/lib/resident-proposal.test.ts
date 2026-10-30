import { getResidentDayTransition } from "#/world/town/get-resident-day-transition"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import { getResidentProposalError } from "#/scripts/lib/get-resident-proposal-error"
import { auditResidentAppearanceSources } from "#/scripts/lib/audit-resident-appearance-sources"
import { auditResidentRoutineSources } from "#/scripts/lib/resident-routine-source"
import { auditSleepingPlaces } from "#/scripts/lib/sleeping-places"
import { auditPersonalStorage } from "#/scripts/lib/personal-storage"

function fixture() {
  const paths = [
      "residents/resident-ルードヴィヒ",
      "towns/town-hue",
      "maps/map-hue-quarter",
      "buildings/building-hue-ludwig",
      "rooms/room-hue-ludwig-1",
      "rooms/room-hue-ludwig-2",
      "rooms/room-hue-ludwig-hall",
      "rooms/room-hue-ludwig-wash",
      "rooms/room-hue-ludwig-toilet",
      "rooms/room-hue-ludwig-fuel",
    ],
    documents = new Map(
      paths.map((path) => {
        const document = readSetting(readFileSync(`.docs/settings/${path}.md`, "utf8"))
        return [document.id, document]
      }),
    )
  const resident = documents.get("resident-ルードヴィヒ"),
    home = documents.get("building-hue-ludwig"),
    bedroom = documents.get("room-hue-ludwig-2")
  if (!resident || !home || !bedroom) throw new Error("Missing authored proposed household")
  const proposal = residentProposalSchema.parse(resident.resident_proposal)
  resident.resident_proposal = proposal
  return { resident, home, bedroom, proposal, documents }
}

it("assigns an authored household, personal bed and storage before native art or schedules exist", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents])
  expect(getResidentProposalError(source)).toBeNull()
  expect(auditSleepingPlaces(source.documents)).toEqual([])
  expect(auditPersonalStorage(source.documents)).toEqual([])
  expect(auditResidentAppearanceSources({ documents: source.documents, residents: [], looks: [] })).toEqual([])
  expect(auditResidentRoutineSources(source.documents, {})).toEqual([])
  expect(JSON.stringify([...source.documents])).toBe(before)
})

it("does not let an existing native resident or routine use a proposal to bypass their source checks", () => {
  const source = fixture(),
    name = source.resident.title
  expect(auditResidentAppearanceSources({ documents: source.documents, residents: [{ name }], looks: [{}] })).toContain(`${source.resident.id}: native resident cannot use an unimplemented proposal`)
  expect(auditResidentRoutineSources(source.documents, { [name]: [{}] })).toContain(`${source.resident.id}: native routine cannot use an unimplemented proposal`)
})

it("keeps normal source requirements when a resident has no explicit proposal", () => {
  const source = fixture()
  delete source.resident.resident_proposal
  expect(auditResidentAppearanceSources({ documents: source.documents, residents: [], looks: [] })).toContain(`${source.resident.id}: missing or invalid appearance source`)
  expect(auditResidentRoutineSources(source.documents, {})).toContain(`${source.resident.id}: missing or invalid routine source`)
})

it("rejects invented native bindings and copied runtime data even in a proposed resident", () => {
  for (const field of ["appearance_source", "routine_source", "appearance", "routine"]) {
    const source = fixture()
    source.resident[field] = {}
    expect(getResidentProposalError(source)).toEqual(new Error("Proposed resident cannot replace native bindings or clear the design gate"))
    expect(auditResidentRoutineSources(source.documents, {})).not.toEqual([])
    expect(auditResidentAppearanceSources({ documents: source.documents, residents: [], looks: [] })).not.toEqual([])
  }
})

it("requires the matching town, household, housing district and work district", () => {
  const source = fixture()
  source.proposal.work_district = source.proposal.home_district
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed resident has no matching home and work districts"))
  source.proposal.work_district = "W"
  source.home.residents = []
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed resident has no consistent home and bedroom"))
  source.resident.town = "town-phanthiet"
  expect(getResidentProposalError(source)).toEqual(new Error("Invalid proposed resident or unplaced town study"))
})

it("retains exact bed and storage ownership checks for the proposed household", () => {
  const source = fixture()
  source.resident.bed_id = "bed-wrong"
  source.resident.storage_ids = []
  expect(auditSleepingPlaces(source.documents)).toContain(`${source.resident.id}: unresolved personal bed`)
  expect(auditPersonalStorage(source.documents)).toContain(`${source.resident.id}: unresolved or inconsistent personal storage`)
})

it("does not clear a proposed resident or household gate", () => {
  const source = fixture()
  source.bedroom.design_gate = "通過"
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed resident household is not implemented"))
  source.resident.design_gate = "通過"
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed resident cannot replace native bindings or clear the design gate"))
})

it("requires the home district and reverse map declarations to agree", () => {
  const source = fixture()
  source.home.proposed_district = "J"
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed resident home has no matching town-map allocation"))
  source.home.proposed_district = "H"
  const map = source.documents.get("map-hue-quarter")
  if (!map) throw new Error("Missing authored map")
  map.residents = []
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed resident home has no matching town-map allocation"))
})

it("does not accept proposed-resident metadata on a different kind of document", () => {
  const source = fixture()
  source.resident.kind = "facilities"
  expect(getResidentProposalError(source)).toEqual(new Error("Invalid proposed resident or unplaced town study"))
  expect(auditResidentRoutineSources(source.documents, {})).not.toEqual([])
  expect(auditResidentAppearanceSources({ documents: source.documents, residents: [], looks: [] })).not.toEqual([])
})

it("matches the declared job district role without treating every trade as a machine workshop", () => {
  const source = fixture()
  source.proposal.work_district = "F"
  expect(getResidentProposalError(source)).toEqual(new Error("Proposed resident has no matching home and work districts"))
  source.proposal.work_district_role = "food"
  for (const segment of source.proposal.day_plan?.segments ?? []) {
    const transition = getResidentDayTransition(segment)
    for (const place of [transition.from, transition.to]) if (place.kind === "district" && place.symbol === "W") place.symbol = "F"
  }
  expect(getResidentProposalError(source)).toBeNull()
})
