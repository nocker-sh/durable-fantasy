import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { getSeatedGarmentSeatError } from "#/world/scene/get-seated-garment-seat-error"
import { getTunicGeometry } from "#/world/scene/figure/get-tunic-geometry"
import { createBodyContext } from "#/world/scene/figure/context"
import { buildBody } from "#/world/scene/figure/body"
import { seatedSupportDepth } from "#/world/scene/figure/seated-support-depth"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
const fixture = (frame: number, name = "ヴィルヘルム") => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-1.md", import.meta.url), "utf8"))
  const chair = room.furniture?.find((part) => part.symbol === "A"),
    table = room.furniture?.find((part) => part.symbol === "T")
  if (!chair || !table || !room.grid) throw new Error("Missing dining furniture")
  const geometry = getDiningSeatGeometry({ chair, table, cell: room.grid.cell_m })
  if (geometry instanceof Error) throw geometry
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === name)],
    pose = getSeatedNativePose({ look, frame, place: geometry.place })
  if (pose instanceof Error) throw pose
  return { look, ...pose, chair: geometry.chairSections, heading: geometry.place.heading }
}

it("keeps both rendered garment surfaces outside the real seat in every native frame", () => {
  for (const frame of Array.from({ length: 17 }).keys()) {
    const props = fixture(frame),
      body = buildBody(props.look, props.skeleton, null)
    expect(body.trouserParts).toHaveLength(2)
    expect(body.trouserParts.every((part) => body.prims.includes(part))).toBe(true)
    expect(body.tunicParts).toHaveLength(1)
    expect(body.coatTailParts).toHaveLength(1)
    expect([...body.tunicParts, ...body.coatTailParts].every((part) => body.prims.includes(part))).toBe(true)
    expect(getSeatedGarmentSeatError(props)).toBeNull()
  }
})
it("moves the original lower fabric span forward and keeps its hem width", () => {
  const props = fixture(0),
    context = createBodyContext(props.look, props.skeleton, null)
  const legacy = getTunicGeometry({ ...context, fold: 0 }),
    folded = getTunicGeometry(context)
  if (legacy instanceof Error) throw legacy
  if (folded instanceof Error) throw folded
  if (!folded.shape.sd) throw new Error("Missing folded tunic surface")
  const length = Math.hypot(...sub(legacy.shape.a, context.hip)),
    knees = lerp3(context.J.calf_l, context.J.calf_r, 0.5)
  const forward = norm([knees[0] - context.hip[0], 0, knees[2] - context.hip[2]]),
    across: [number, number, number] = [forward[2], 0, -forward[0]]
  const hem = add(context.hip, mul(forward, length)),
    edge = add(hem, mul(across, legacy.shape.r))
  expect(Math.abs(folded.shape.sd(edge))).toBeLessThan(1e-10)
  expect(folded.shape.sd(add(edge, mul(across, 0.01)))).toBeGreaterThan(0)
  expect(folded.shape.bounds?.min[1]).toBeCloseTo(context.hip[1] - seatedSupportDepth(props.look), 12)
  expect(legacy.shape.kind).toBe("cone")
})
it("refuses an intrusive seat and never approves an unreviewed skirt from an empty garment list", () => {
  const props = fixture(0),
    raised = props.chair.map((part) => {
      if (part.part !== "seat") return part
      return { ...part, y0: part.y0 + 0.12, y1: part.y1 + 0.12 }
    })
  expect(getSeatedGarmentSeatError({ ...props, chair: raised })).toBeInstanceOf(Error)
  expect(getSeatedGarmentSeatError(fixture(0, "ゾフィー"))).toEqual(new Error("Unavailable reviewed garment or seat"))
})

it("keeps the jacket colour on the actual tail wall away from its trim edge", () => {
  const props = fixture(0),
    part = buildBody(props.look, props.skeleton, null).coatTailParts[0]
  if (!part?.sd || !props.look.jacket) throw new Error("Missing reviewed coat")
  const point = add(props.skeleton.p.pelvis, [0.19, 0, 0.18])
  expect(part.sd(point)).toBeLessThan(0)
  expect(part.m(point, [1, 0, 0], [0, 1, 0])[0]).toBe(props.look.jacket)
})
