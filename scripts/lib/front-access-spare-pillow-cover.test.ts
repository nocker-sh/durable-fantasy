import { getFrontAccessSparePillowCoverPlacement } from "#/scripts/lib/get-front-access-spare-pillow-cover-placement"
import { getFrontAccessStorageReview } from "#/scripts/lib/get-front-access-storage-review"
import { getRoomStorageSection } from "#/scripts/lib/get-room-storage-section"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
import { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getStorageSparePillowCoverDefinition } from "#/scripts/lib/get-storage-spare-pillow-cover-definition"
import { getFrontAccessHandleExternalObstacleContext } from "#/scripts/lib/get-front-access-handle-external-obstacle-context"
import { getHeadingLocalTranslationBounds } from "#/world/scene/get-heading-local-translation-bounds"
import { sparePillowCoverStorageSchema } from "#/scripts/lib/spare-pillow-cover-storage-schema"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  const slot = personalStorageSchema.parse(room.personal_storage)[0],
    cover = slot.packing?.front_access?.spare_pillow_cover
  if (!cover) throw new Error("Missing spare cover package")
  return { room, building, slot, cover }
}

it("keeps both owners' covers separate from the top blanket and the three original parcels", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source),
      plan = getFrontAccessHandlePlan(source)
    if (plan instanceof Error || !plan.sparePillowCover || !plan.spareBlanket) throw new Error("Missing separate top packages")
    const cover = plan.sparePillowCover
    expect(cover.source.id).toBe(`bed-h1-${number}-1:pillow:spare-cover`)
    expect(cover.clothVolume).toBeCloseTo(0.000539, 14)
    expect(cover.box.bottom).toBe(plan.spec.bounds.top)
    expect(plan.spareBlanket.box.z0 - cover.box.z1).toBeGreaterThan(source.slot.packing?.clearance_m ?? 0)
    expect(plan.topObjects).toEqual([plan.spareBlanket.box, cover.box])
    expect(plan.contents).toHaveLength(3)
    expect(source.slot.packing?.front_access?.objects.map((object) => object.id)).toEqual(source.slot.packing?.objects.map((object) => object.id))
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("refuses borrowed cloth, another owner's cover and a package smaller than the allocated cloth volume", () => {
  const source = fixture(),
    original = { ...source.cover }
  source.cover.source_cloth = "storage-h1-3-1:blanket-cloth"
  expect(getStorageSparePillowCoverDefinition(source)).toBeInstanceOf(Error)
  Object.assign(source.cover, original)
  source.cover.id = "bed-h1-4-1:pillow:spare-cover"
  expect(getStorageSparePillowCoverDefinition(source)).toBeInstanceOf(Error)
  Object.assign(source.cover, original)
  source.cover.size_m = [0.01, 0.001, 0.01]
  expect(getStorageSparePillowCoverDefinition(source)).toEqual(new Error("Spare pillow cover envelope loses cloth volume"))
  Object.assign(source.cover, original)
  const materials = sleepingMaterialsSchema.parse(source.room.sleeping_materials)
  if (!materials.pillow_cover_cutting) throw new Error("Missing measured cloth")
  materials.pillow_cover_cutting.cloth_thickness_m = 1
  source.room.sleeping_materials = materials
  expect(getStorageSparePillowCoverDefinition(source)).toEqual(new Error("Spare pillow cover envelope loses cloth volume"))
})

it("refuses an overlapping blanket footprint, unsupported placement and cabinet overhang", () => {
  const source = fixture(),
    blanket = source.slot.packing?.front_access?.spare_blanket
  if (!blanket) throw new Error("Missing top blanket")
  source.cover.position_m = [...blanket.position_m]
  expect(getFrontAccessHandlePlan(source)).toBeInstanceOf(Error)
  source.cover.position_m = [0.4, 0, 0.03]
  expect(getFrontAccessHandlePlan(source)).toBeInstanceOf(Error)
  expect(sparePillowCoverStorageSchema.safeParse({ ...source.cover, position_m: [0.08, 0.01, 0.03] }).success).toBe(false)
})

it("carries the same cover box into static solids and both directions' whole-walk obstacle envelopes", () => {
  for (const leaf of ["north", "south"] satisfies readonly ("north" | "south")[]) {
    const source = fixture(),
      plan = getFrontAccessHandlePlan(source),
      start = getFrontAccessHandleFrame({ ...source, leaf, progress: 0 }),
      end = getFrontAccessHandleFrame({ ...source, leaf, progress: 1 }),
      context = getFrontAccessHandleExternalObstacleContext({ ...source, leaf })
    if (plan instanceof Error || start instanceof Error || end instanceof Error || context instanceof Error || !plan.sparePillowCover) throw new Error("Missing cover obstacle context")
    const box = plan.sparePillowCover.box,
      envelope = getHeadingLocalTranslationBounds({ box, from: [start.body[0], start.posed.rootY, start.body[1]], to: [end.body[0], end.posed.rootY, end.body[1]], heading: Math.PI / 2 })
    if (envelope instanceof Error) throw envelope
    expect(start.solids).toContainEqual(box)
    expect(end.solids).toContainEqual(box)
    expect(context.fixedBoxes).toContainEqual(envelope)
  }
})

it("rejects the wrong wood supplier or case identity and a case that shrinks the folded envelope", () => {
  const source = fixture(),
    box = source.cover.container,
    original = { ...box }
  box.maker = "resident-ベルタ"
  expect(getStorageSparePillowCoverDefinition(source)).toBeInstanceOf(Error)
  Object.assign(box, original)
  box.id = "another-owner:box"
  expect(getStorageSparePillowCoverDefinition(source)).toBeInstanceOf(Error)
  Object.assign(box, original)
  box.size_m = [0.29, 0.08, 0.21]
  expect(getStorageSparePillowCoverDefinition(source)).toBeInstanceOf(Error)
})

it("rejects a real obstruction hit by the lid between clear closed and vertical endpoints", () => {
  const source = fixture(),
    review = getFrontAccessStorageReview({ slot: source.slot, cell: source.room.grid?.cell_m ?? NaN }),
    section = getRoomStorageSection(source.room, source.building, ["C", "R"])
  if (review instanceof Error || section instanceof Error) throw new Error("Missing cabinet section")
  const placement = getFrontAccessSparePillowCoverPlacement({ ...source, spec: review.spec, section })
  if (!placement || placement instanceof Error) throw new Error("Missing case placement")
  const box = placement.box,
    hinge = box.top - source.cover.container.lid_m,
    depth = box.z1 - box.z0,
    maximumAtEndpoint = hinge + depth
  const peakAngle = Math.atan2(depth, source.cover.container.lid_m),
    peakHeight = hinge + source.cover.container.lid_m * Math.cos(peakAngle) + depth * Math.sin(peakAngle)
  const obstacle = {
    x0: (box.x0 + box.x1) / 2 - 0.001,
    x1: (box.x0 + box.x1) / 2 + 0.001,
    z0: box.z0 - 0.000001,
    z1: box.z0 + 0.000001,
    bottom: (maximumAtEndpoint + peakHeight) / 2,
    top: peakHeight + 0.000001,
  }
  expect(obstacle.bottom).toBeGreaterThan(box.top)
  expect(obstacle.bottom).toBeGreaterThan(maximumAtEndpoint)
  expect(peakHeight).toBeGreaterThan(obstacle.bottom)
  expect(peakHeight).toBeLessThan(obstacle.top)
  expect(getFrontAccessSparePillowCoverPlacement({ ...source, spec: review.spec, section: { ...section, obstacles: [...section.obstacles, obstacle] } })).toEqual(
    new Error("Pillow cover lid sweep intersects the room"),
  )
})
