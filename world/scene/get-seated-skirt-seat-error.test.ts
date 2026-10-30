import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { getSeatedSkirtSeatError } from "#/world/scene/get-seated-skirt-seat-error"
import { buildBody } from "#/world/scene/figure/body"
import { createBodyContext } from "#/world/scene/figure/context"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import { addVector3 as add } from "../../lib/engine/add-vector3"
import { lerpVector3 as lerp3 } from "../../lib/engine/lerp-vector3"
import { normalizeVector3 as norm } from "../../lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "../../lib/engine/subtract-vector3"
import { scaleVector3 as mul } from "../../lib/engine/scale-vector3"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
const fixture = (frame: number, name = "ゾフィー") => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-1.md", import.meta.url), "utf8"))
  const chair = room.furniture?.find((part) => part.symbol === "B"),
    table = room.furniture?.find((part) => part.symbol === "T")
  if (!chair || !table || !room.grid) throw new Error("Missing dining furniture")
  const geometry = getDiningSeatGeometry({ chair, table, cell: room.grid.cell_m })
  if (geometry instanceof Error) throw geometry
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === name)],
    pose = getSeatedNativePose({ look, frame, place: geometry.place })
  if (pose instanceof Error) throw pose
  return { look, ...pose, chair: geometry.chairSections, heading: geometry.place.heading }
}
it("checks every real skirt layer and both trousers throughout all native frames", () => {
  for (const frame of Array.from({ length: 17 }).keys()) {
    const props = fixture(frame),
      body = buildBody(props.look, props.skeleton, null)
    expect(body.skirtParts).toHaveLength(3)
    expect(body.skirtParts.every((part) => body.prims.includes(part))).toBe(true)
    expect(getSeatedSkirtSeatError(props)).toBeNull()
  }
})
it("retains the original tilted-cone penetration as a counterexample", () => {
  const props = fixture(0),
    context = createBodyContext(props.look, props.skeleton, null)
  const oldBase = add(lerp3(context.J.calf_l, context.J.calf_r, 0.5), [0, -0.1, 0.02])
  const oldTop = context.UW([0, 0.14, 0]),
    axis = norm(sub(oldTop, oldBase))
  if (!props.look.overskirt) throw new Error("Missing original overskirt")
  const old = context.openShell({
    hemC: add(oldBase, mul(axis, 0.04)),
    topC: add(oldTop, mul(axis, 0.01)),
    rHem: 0.215 * 1.06,
    rTop: 0.1 * 1.1,
    frame: "pelvis",
    open: 0.02,
    flare: 0.3,
    ramp: props.look.overskirt,
  })
  const point: [number, number, number] = [0.123665, 0.3755, -0.13503],
    seat = props.chair.find((part) => part.part === "seat")
  if (!old.sd || !seat) throw new Error("Missing original geometry")
  const box = toHeadingLocalCuboid({ box: { x0: seat.x0, x1: seat.x1, bottom: seat.y0, top: seat.y1, z0: seat.z0, z1: seat.z1 }, root: props.root, heading: props.heading })
  if (box instanceof Error) throw box
  expect(point[0]).toBeGreaterThan(box.x0)
  expect(point[0]).toBeLessThan(box.x1)
  expect(point[1]).toBeGreaterThan(box.bottom)
  expect(point[1]).toBeLessThan(box.top)
  expect(point[2]).toBeGreaterThan(box.z0)
  expect(point[2]).toBeLessThan(box.z1)
  expect(old.sd(point)).toBeLessThan(0)
  expect(buildBody(props.look, props.skeleton, null).skirtParts.every((part) => part.sd && part.sd(point) > 0)).toBe(true)
})
it("refuses a raised or extended board and an outfit without skirts", () => {
  const props = fixture(0)
  expect(getSeatedSkirtSeatError({ ...props, chair: props.chair.map((part) => (part.part === "seat" ? { ...part, y1: part.y1 + 0.01 } : part)) })).toBeInstanceOf(Error)
  expect(getSeatedSkirtSeatError({ ...props, chair: props.chair.map((part) => (part.part === "seat" ? { ...part, z0: part.z0 - 0.3, z1: part.z1 + 0.3 } : part)) })).toBeInstanceOf(Error)
  expect(getSeatedSkirtSeatError(fixture(0, "ヴィルヘルム"))).toEqual(new Error("Unavailable reviewed skirt layers or seat"))
})
