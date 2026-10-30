import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getFrontAccessStorageError } from "#/scripts/lib/get-front-access-storage-error"
import { getFrontAccessStorageReview } from "#/scripts/lib/get-front-access-storage-review"
import { getSlidingCabinetPlan } from "#/world/town/get-sliding-cabinet-plan"
import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import { translatedCuboid } from "#/lib/engine/translated-cuboid"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    slot = personalStorageSchema.parse(room.personal_storage)[0]
  const review = getFrontAccessStorageReview({ slot, cell: room.grid?.cell_m ?? NaN })
  if (review instanceof Error) throw review
  const building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, slot, review, building }
}

it("keeps both owners' actual parcels, unrelated room features and complete supported sliding paths", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source)
    expect(getFrontAccessStorageError(source)).toBeNull()
    for (const side of ["north", "south"] satisfies ("north" | "south")[]) {
      const direction = { north: 1, south: -1 }
      expect(source.review.open[side]).toEqual(source.review.closed[side].map((piece) => ({ ...piece, ...translatedCuboid(piece, [0, 0, source.review.travel[side] * direction[side]]) })))
      const volume = source.review.closed[side].reduce((sum, piece) => sum + (piece.x1 - piece.x0) * (piece.z1 - piece.z0) * (piece.top - piece.bottom), 0)
      const spec = source.review.spec,
        panelWidth = (spec.bounds.z1 - spec.bounds.z0 - 2 * spec.board + spec.overlap) / 2
      expect(volume).toBeCloseTo(spec.panel * (panelWidth * (spec.bounds.top - spec.board - spec.storageFloor) - { north: spec.pull.width, south: spec.pull.southWidth }[side] * spec.pull.height), 12)
    }
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("rejects a blocker clear of both endpoints but crossed by the solid board between them", () => {
  const source = fixture(),
    spec = source.review.spec,
    panelWidth = (spec.bounds.z1 - spec.bounds.z0 - 2 * spec.board + spec.overlap) / 2
  const centre = spec.bounds.z0 + spec.board + panelWidth - spec.pull.fromMeeting
  const obstacle = {
    x0: spec.bounds.x0 + spec.guide + spec.panel / 4,
    x1: spec.bounds.x0 + spec.guide + (3 * spec.panel) / 4,
    z0: centre - spec.pull.width / 4,
    z1: centre + spec.pull.width / 4,
    bottom: spec.pull.bottom + spec.pull.height / 4,
    top: spec.pull.bottom + (3 * spec.pull.height) / 4,
  }
  for (const endpoint of [source.review.closed.north, source.review.open.north])
    expect(endpoint.some((piece) => cuboidTranslationHits({ relative: piece, from: [0, 0, 0], to: [0, 0, 0], obstacle: obstacle }))).toBe(false)
  expect(getSlidingCabinetPlan({ spec, contents: [obstacle] })).toEqual(new Error("Sliding cabinet leaf intersects a fixed board or stored object"))
})

it("requires lifting over real lower guides rather than allowing parcels through them", () => {
  const source = fixture(),
    piece = source.review.contents[0],
    distance = source.review.spec.bounds.x0 - piece.x1
  expect(source.review.fixed.some((board) => cuboidTranslationHits({ relative: piece, from: [0, 0, 0], to: [distance, 0, 0], obstacle: board }))).toBe(true)
  expect(getFrontAccessStorageError(source)).toBeNull()
})

it("refuses unchanged parcels straddling the two openings and refuses shrinking them to fit", () => {
  const source = fixture(),
    alternative = source.slot.packing?.front_access
  if (!alternative) throw new Error("Missing front-access source")
  alternative.objects[1].position_m[2] = 0.445
  expect(getFrontAccessStorageError(source)).toEqual(new Error("Stored parcel cannot pass through either sliding opening"))
  alternative.objects[1].size_m[2] = 0.01
  expect(getFrontAccessStorageError(source)).toEqual(new Error("Front-access alternative changes an owned parcel"))
})

it("refuses moving unrelated room features, obstructed approaches and malformed tracks", () => {
  const source = fixture(),
    alternative = source.slot.packing?.front_access
  if (!alternative) throw new Error("Missing front-access source")
  alternative.grid_rows[0] = "#..###"
  expect(getFrontAccessStorageError(source)).toBeInstanceOf(Error)
  alternative.grid_rows[0] = "#DD###"
  alternative.use_space = [3, 2, 1, 1]
  expect(getFrontAccessStorageError(source)).toEqual(new Error("Front-access approach is not empty floor"))
  expect(getSlidingCabinetPlan({ spec: { ...source.review.spec, guide: 1 }, contents: [] })).toBeInstanceOf(Error)
  expect(getSlidingCabinetPlan({ spec: { ...source.review.spec, rearTravel: source.review.travel.north }, contents: [] })).toEqual(new Error("Rear finger pull is concealed by the front leaf"))
  expect(getSlidingCabinetPlan({ spec: { ...source.review.spec, pull: { ...source.review.spec.pull, bottom: 0 } }, contents: [] })).toBeInstanceOf(Error)
  expect(getSlidingCabinetPlan({ spec: source.review.spec, contents: [{ ...source.review.contents[0], top: NaN }] })).toBeInstanceOf(Error)
  alternative.use_space = [1, 7, 3, 4]
  alternative.top_m = 3
  expect(getFrontAccessStorageError(source)).toEqual(new Error("Front-access storage leaves the checked room section"))
})
