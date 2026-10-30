import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { auditSleepingMaterials } from "#/scripts/lib/audit-sleeping-materials"
import { getRoomBedDefinition } from "#/scripts/lib/get-room-bed-definition"
import { sleepingMaterialsSchema, measuredSleepingPlaceSchema } from "#/scripts/lib/sleeping-materials-schema"
import { bedDimensionsSchema } from "#/scripts/lib/bed-dimensions-schema"
import { bedParts } from "#/world/town/bed-parts"
const read = (kind: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${id}.md`, import.meta.url), "utf8"))
const fixture = (id = "room-h1-3") => {
  const room = read("rooms", id),
    residents = ["ヴィルヘルム", "ゾフィー", "ゴットフリート", "ヨーゼフ", "ベルタ", "マグダレーナ", "マティアス"].map((name) => read("residents", `resident-${name}`)),
    documents = new Map(
      [
        read("rooms", "room-h1-3"),
        read("rooms", "room-h1-4"),
        room,
        read("rooms", "room-h-c2-weaving"),
        read("facilities", "facility-h7-wool-preparation"),
        read("facilities", "facility-square-well"),
        ...residents,
      ].map((document) => [document.id, document]),
    ),
    plan = sleepingMaterialsSchema.parse(room.sleeping_materials)
  const definition = getRoomBedDefinition({ room, bedId: plan.bed })
  if (definition instanceof Error) throw definition
  return { room, documents, plan, definition }
}
it("includes declared blanket cuts in the room's material audit", () => {
  const source = fixture(),
    cutting = source.plan.blanket_cutting
  if (!cutting) throw new Error("Missing blanket cutting proposal")
  source.room.sleeping_materials = source.plan
  cutting.cuts[1].output = cutting.cuts[0].output
  expect(auditSleepingMaterials(source.room, source.documents)).toContain("sleeping-materials: Blanket cutting duplicates or changes its outputs")
})
it("gives the two owners individual measured frames and mattresses with registered suppliers", () => {
  const first = fixture(),
    second = fixture("room-h1-4")
  for (const f of [first, second]) {
    expect(auditRoomGrid(f.room)).toEqual([])
    expect(auditSleepingMaterials(f.room, f.documents)).toEqual([])
    expect([f.definition.width, f.definition.depth]).toEqual([1, 2])
    expect(bedParts({ at: [0, 0], size: [f.definition.width, f.definition.depth], floor: 0, bed: f.definition.bed })).toHaveLength(13)
    expect(f.room.design_gate).toBe("未通過")
  }
  expect(first.definition.bed.frameHeight + first.definition.bed.mattressThickness).toBeCloseTo(0.52)
  expect(second.definition.bed.frameHeight + second.definition.bed.mattressThickness).toBeCloseTo(0.44)
})
it("rejects an unknown or ambiguous assignment, missing physical measurements and invalid frame support", () => {
  const f = fixture(),
    piece = f.definition.furniture,
    original = bedDimensionsSchema.parse(piece.bed)
  expect(getRoomBedDefinition({ room: f.room, bedId: "missing-bed" })).toBeInstanceOf(Error)
  piece.bed = undefined
  expect(getRoomBedDefinition({ room: f.room, bedId: f.plan.bed })).toEqual(new Error("Missing bed dimensions"))
  piece.bed = { ...original, deck_thickness_m: 1 }
  expect(getRoomBedDefinition({ room: f.room, bedId: f.plan.bed })).toEqual(new Error("Invalid bed dimensions"))
  piece.bed = original
  const places = measuredSleepingPlaceSchema.parse(f.room.sleeping_places)
  f.room.sleeping_places = [...places, places[0]]
  expect(getRoomBedDefinition({ room: f.room, bedId: f.plan.bed })).toEqual(new Error("Measured bed assignment is missing or ambiguous"))
})
it("refuses mismatched owners, professions, missing supplier dependencies and premature design approval", () => {
  const f = fixture()
  f.definition.furniture.owner = "ゾフィー"
  expect(auditSleepingMaterials(f.room, f.documents)).toContain("sleeping-materials: Measured bed and sleeping owner disagree")
  f.definition.furniture.owner = "ヴィルヘルム"
  f.room.sleeping_materials = { ...f.plan, frame: { ...f.plan.frame, maker: f.plan.frame.timber_supplier } }
  expect(auditSleepingMaterials(f.room, f.documents)).toContain(`sleeping-materials: Missing matching supplier prerequisite ${f.plan.frame.timber_supplier}`)
  f.room.sleeping_materials = f.plan
  f.room.design_dependencies = []
  expect(auditSleepingMaterials(f.room, f.documents)).toContain(`sleeping-materials: Missing matching supplier prerequisite ${f.plan.textile.tailor}`)
  f.room.design_gate = "通過"
  expect(auditSleepingMaterials(f.room, f.documents)).toContain("sleeping-materials: Sleeping and daily linen care remain unverified")
})

it("does not share an individual's pillow or blanket with a different sleeping-bed identity", () => {
  const f = fixture(),
    measurements = bedDimensionsSchema.parse(f.definition.furniture.bed)
  if (!measurements.linen) throw new Error("Missing authored linen")
  f.definition.furniture.bed = { ...measurements, linen: measurements.linen.map((piece) => ({ ...piece, id: `another-bed:${piece.kind}` })) }
  expect(auditSleepingMaterials(f.room, f.documents)).toContain("sleeping-materials: Made linen has no unique sleeping-bed identity")
  f.definition.furniture.bed = { ...measurements, linen: null }
  expect(auditSleepingMaterials(f.room, f.documents)).toContain("sleeping-materials: Made linen has no unique sleeping-bed identity")
})

it("includes the pillow cover face identity in the room material audit", () => {
  const source = fixture(),
    cutting = source.plan.pillow_cover_cutting
  if (!cutting) throw new Error("Missing pillow cover proposal")
  source.room.sleeping_materials = source.plan
  cutting.cuts[1].face = cutting.cuts[0].face
  expect(auditSleepingMaterials(source.room, source.documents)).toContain("sleeping-materials: Pillow covers lack unique complete face sets")
})
