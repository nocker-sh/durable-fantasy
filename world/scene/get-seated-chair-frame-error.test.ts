import { getTunicGeometry } from "#/world/scene/figure/get-tunic-geometry"
import { buildCoatTails } from "#/world/scene/figure/build-coat-tails"
import { createBodyContext } from "#/world/scene/figure/context"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import { getSeatedGarmentSeatError } from "#/world/scene/get-seated-garment-seat-error"
import { getConeSeparationField } from "#/lib/graphics/ray/get-cone-separation-field"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { getSeatedChairFrameError } from "#/world/scene/get-seated-chair-frame-error"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { buildBody } from "#/world/scene/figure/body"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
const fixture = (width?: number) => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-1.md", import.meta.url), "utf8"))
  const chair = room.furniture?.find((furniture) => furniture.symbol === "A"),
    table = room.furniture?.find((furniture) => furniture.symbol === "T")
  if (!chair?.seat || !table || !room.grid) throw new Error("Missing dining furniture")
  if (width !== undefined) chair.seat.width_m = width
  const geometry = getDiningSeatGeometry({ chair, table, cell: room.grid.cell_m })
  if (geometry instanceof Error) throw geometry
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ヴィルヘルム")]
  const pose = getSeatedNativePose({ look, frame: 0, place: geometry.place })
  if (pose instanceof Error) throw pose
  return { look, ...pose, chair: geometry.chairSections, heading: geometry.place.heading }
}
it("clears the fitted chair frame and retains the former unresolved clothing/leg clearance", () => {
  expect(getSeatedChairFrameError(fixture())).toBeNull()
  const oldChair = fixture(0.44),
    context = createBodyContext(oldChair.look, oldChair.skeleton, null)
  const oldTails = buildCoatTails({ ...context, fold: 0 })
  expect(
    oldChair.chair
      .filter((part) => part.part === "leg")
      .some((part) => {
        const box = toHeadingLocalCuboid({ box: { x0: part.x0, x1: part.x1, bottom: part.y0, top: part.y1, z0: part.z0, z1: part.z1 }, root: oldChair.root, heading: oldChair.heading })
        if (box instanceof Error) throw box
        return !canSeparatePrimitiveFromCuboid({ primitive: oldTails, box })
      }),
  ).toBe(true)
  expect(getSeatedChairFrameError(oldChair)).toBeNull()
})
it("rejects a back moved into the actual torso rather than exempting a whole clothing primitive", () => {
  const props = fixture(),
    witness: [number, number, number] = [0, 0.6, -0.2]
  expect(buildBody(props.look, props.skeleton, null).prims.some((primitive) => primitive.sd && primitive.sd(witness) < -0.005)).toBe(true)
  const world = toHeadingWorldPoint(witness, props.root, props.heading)
  const chair = props.chair.map((section) => {
    if (section.part !== "back") return section
    return { ...section, z0: world[2] - 0.02, z1: world[2] + 0.02 }
  })
  expect(getSeatedChairFrameError({ ...props, chair })).toBeInstanceOf(Error)
  expect(getSeatedChairFrameError({ ...props, chair: chair.filter((section) => section.part !== "leg") })).toEqual(new Error("Invalid seated chair frame"))
})

it("retains the former undeformed tunic as a negative fixture while clearing the seated garment", () => {
  const props = fixture(),
    board = props.chair.find((section) => section.part === "seat")
  if (!board) throw new Error("Missing chair seat")
  const box = toHeadingLocalCuboid({ box: { x0: board.x0, x1: board.x1, bottom: board.y0, top: board.y1, z0: board.z0, z1: board.z1 }, root: props.root, heading: props.heading })
  if (box instanceof Error) throw box
  const witness: [number, number, number] = [0, 0.35, -0.25]
  expect(witness[0]).toBeGreaterThan(box.x0)
  expect(witness[0]).toBeLessThan(box.x1)
  expect(witness[1]).toBeGreaterThan(box.bottom)
  expect(witness[1]).toBeLessThan(box.top)
  expect(witness[2]).toBeGreaterThan(box.z0)
  expect(witness[2]).toBeLessThan(box.z1)
  const oldTunic = getTunicGeometry({ ...createBodyContext(props.look, props.skeleton, null), fold: 0 })
  if (oldTunic instanceof Error) throw oldTunic
  const oldField = getConeSeparationField(oldTunic.shape)
  expect(oldField?.value(witness)).toBeLessThan(-0.005)
  expect(buildBody(props.look, props.skeleton, null).prims.some((primitive) => primitive.sd && primitive.sd(witness) < -0.005)).toBe(false)
  expect(getSeatedGarmentSeatError(props)).toBeNull()
  expect(getSeatedChairFrameError(props)).toBeNull()
})
