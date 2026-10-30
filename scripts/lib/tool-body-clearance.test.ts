import { addVector3 as add } from "../../lib/engine/add-vector3"
import { scaleVector3 as mul } from "../../lib/engine/scale-vector3"
import { normalizeVector3 as norm } from "../../lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "../../lib/engine/subtract-vector3"
import { certifyForearmBody } from "../../world/scene/figure/forearm-body-clearance"
import { certifyWorkingArmTool } from "../../world/scene/figure/working-arm-tool-clearance"
import { readFileSync } from "node:fs"
import { expect, it, vi } from "vitest"
import * as bodyModule from "#/world/scene/figure/body"
import { readSetting } from "#/scripts/lib/read-setting"
import { shelfDimensions } from "./shelf-dimensions"
import { hearthDimensions } from "./hearth-dimensions"
import { hearthSpatialStrokes } from "#/world/town/hearth-spatial-strokes"
import { workingToolGeometry } from "#/world/town/working-tool-geometry"
import { certifyToolFixedBody } from "../../world/scene/figure/tool-fixed-body-clearance"
import { nativeWorkStrokeEndpoints } from "../../world/scene/figure/work-stroke"
import { RESIDENTS, RESIDENT_LOOKS } from "../../world/town/residents"
import { quarterTurnPoint } from "../../lib/engine/quarter-turn-point"
import type { Vector3Tuple as V3 } from "../../lib/engine/vector3-types"
function fixture(id: string) {
  const room = readSetting(readFileSync(new URL(`../../.docs/settings/rooms/room-${id}-1.md`, import.meta.url), "utf8")),
    f = room.furniture!.find((f) => f.hearth_maintenance)!,
    op = f.hearth_maintenance!,
    k = room.grid!.cell_m,
    [x, z, w, d] = f.rect.map((v) => v * k),
    work = hearthSpatialStrokes({
      bounds: { x0: x, z0: z, x1: x + w, z1: z + d },
      front: f.hearth_front!,
      spec: hearthDimensions(f.hearth),
      grip: op.grip_m,
      height: op.grip_height_m,
      width: op.tool.blade_width_m,
      thickness: op.tool.blade_thickness_m,
      length: op.tool.length_m,
    }),
    rack = room.furniture!.find((f) => f.symbol === op.tool.storage!.furniture)!,
    item = shelfDimensions(rack.shelf, rack.rect[2] * k, rack.rect[3] * k).items!.find((i) => i.id === op.tool.storage!.item)!,
    tool = workingToolGeometry(f.hearth_front!, work.tilt.angle, { width: item.width, thickness: item.depth, length: item.height, gripFromBlade: work.tilt.gripFromBlade, ...item.tool! }),
    look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => `resident-${r.name}` === op.operator)],
    candidate = op.work_pose_candidate!,
    grips: [V3, V3] = [[...work.strokes[0].grip], [...work.strokes[1].grip]],
    pose = () => nativeWorkStrokeEndpoints({ look: look, candidate: candidate, grips: grips, axis: work.axis })[0]
  return { look, axis: work.axis, candidate, grips, tool, pose, check: () => certifyToolFixedBody({ base: pose(), candidate: candidate, grips: grips, tool: tool }) }
}
it("certifies both exact tool parts against every fixed body primitive in both rooms", () => {
  for (const id of ["h-m5", "h10"]) {
    const f = fixture(id),
      base = f.pose(),
      result = f.check()
    expect(result.parts).toBe(2)
    expect(result.primitives).toBe(base.body.prims.length - base.body.armParts[f.candidate.hand].length)
    for (const side of ["l", "r"] as const) expect(base.body.armParts[side].every((p) => base.body.prims.includes(p))).toBe(true)
  }
})
it("rejects the actual handle intersection with the former opposite-arm pose", () => {
  const f = fixture("h-m5"),
    free = f.candidate.off_hand!
  delete f.candidate.off_hand
  const base = f.pose(),
    handle = f.tool.parts.find((p) => p.part === "handle")!.bounds,
    local = [handle.x1 - 0.0005, handle.top - 0.0005, handle.z1 - 0.0005],
    world = f.grips[1].map((v, i) => v + f.tool.axes.reduce((sum, axis, j) => sum + axis[i] * local[j], 0)),
    inverse = ((4 - base.turn) % 4) as 0 | 1 | 2 | 3,
    [x, z] = quarterTurnPoint(world[0] - f.candidate.body_m[0], world[2] - f.candidate.body_m[1], inverse),
    point: V3 = [x, world[1] - base.rootY, z]
  expect(base.body.armParts.l.some((p) => p.sd!(point) < 0)).toBe(true)
  expect(f.check).toThrow("fixed-body clearance remains unresolved")
  f.candidate.off_hand = free
  expect(f.check().parts).toBe(2)
})
it("rejects unreachable free-hand targets rather than stretching the other arm", () => {
  const f = fixture("h-m5")
  f.candidate.off_hand!.palm_m[0] -= 4
  expect(f.pose).toThrow("off-hand target is unreachable")
})

it("keeps the blade clear and the handle on the palm side throughout both working strokes", () => {
  for (const id of ["h-m5", "h10"]) {
    const f = fixture(id)
    expect(certifyWorkingArmTool({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.axis, tool: f.tool }).intervals).toBeGreaterThan(0)
  }
})
it("rejects a handle extending behind the wrist and a blade entering the hand", () => {
  const f = fixture("h10"),
    handle = f.tool.parts.find((p) => p.part === "handle")!,
    original = structuredClone(f.tool)
  handle.bounds.top = 0.4
  expect(() => certifyWorkingArmTool({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.axis, tool: f.tool })).toThrow("Working arm/tool clearance remains unresolved")
  f.tool.parts = original.parts
  const changed = f.tool.parts.find((p) => p.part === "blade")!
  changed.bounds = { x0: -0.01, x1: 0.01, bottom: -0.01, top: 0.01, z0: -0.01, z1: 0.01 }
  expect(() => certifyWorkingArmTool({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.axis, tool: f.tool })).toThrow("Working arm/tool clearance remains unresolved")
})
it("rejects a handle too large for the palm and a grip outside the handle", () => {
  const f = fixture("h-m5"),
    handle = f.tool.parts.find((p) => p.part === "handle")!,
    original = structuredClone(handle.bounds)
  handle.bounds.x0 = -0.2
  handle.bounds.x1 = 0.2
  expect(() => certifyWorkingArmTool({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.axis, tool: f.tool })).toThrow("does not fit the native palm core")
  handle.bounds = original
  handle.bounds.top = -0.001
  expect(() => certifyWorkingArmTool({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.axis, tool: f.tool })).toThrow("grip is not within the handle")
})

it("certifies the forearm, palm and cuff against every fixed body primitive throughout both strokes", () => {
  for (const id of ["h-m5", "h10"]) {
    const f = fixture(id),
      result = certifyForearmBody({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.axis })
    expect(result.intervals).toBeGreaterThan(1)
    expect(result.primitives).toBe(f.pose().body.prims.length - f.pose().body.armParts[f.candidate.hand].length)
  }
})
it("refines the former hall location only with actual body certificates and retains its unresolved legacy boundary", () => {
  const f = fixture("h-m5")
  f.candidate.body_m = [5.15, 1.9]
  expect(certifyForearmBody({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.axis }).intervals).toBeGreaterThan(1)
  const buildBody = bodyModule.buildBody
  const legacy = vi.spyOn(bodyModule, "buildBody").mockImplementation((...args) => {
    const body = buildBody(...args)
    // Preserve geometry and enclosures; the legacy input lacks only the optional segment proofs.
    for (const primitive of body.prims) {
      delete primitive.separationFields
    }
    return body
  })
  try {
    expect(() => certifyForearmBody({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.axis })).toThrow("forearm/body clearance remains unresolved")
  } finally {
    legacy.mockRestore()
  }
})

it.each(["h10", "h-m5"])("rejects actual contact between the working forearm and opposite palm in %s", (id) => {
  const f = fixture(id)
  if (id === "h-m5") f.candidate.body_m = [5.15, 1.9]
  const original = f.pose(),
    elbow = add(original.solution.elbow, mul(norm(sub(original.skeleton.p.upperarm_l, original.solution.elbow)), 0.04)),
    [x, z] = quarterTurnPoint(elbow[0], elbow[2], original.turn)
  f.candidate.off_hand = { palm_m: [x + f.candidate.body_m[0], elbow[1] + original.rootY, z + f.candidate.body_m[1]], pole: [1, 0, 1] }
  const pose = f.pose(),
    point = pose.solution.elbow
  expect(pose.body.armParts.l.some((p) => p.sd!(point) < 0)).toBe(true)
  expect(pose.body.armParts.r.some((p) => p.sd!(point) < 0)).toBe(true)
  expect(() => certifyForearmBody({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.axis })).toThrow("forearm/body clearance remains unresolved")
})

it("rejects a shield moving with the working arm instead of treating it as fixed", () => {
  const f = fixture("h10")
  expect(() => certifyForearmBody({ look: { ...f.look, shield: "round" }, candidate: { ...f.candidate, hand: "l" }, grips: f.grips, axis: f.axis })).toThrow("Working-arm shield motion")
})
