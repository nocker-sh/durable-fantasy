import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { hearthRoomSection } from "./hearth-room-section"
import { hearthDimensions } from "./hearth-dimensions"
import { hearthSpatialStrokes } from "#/world/town/hearth-spatial-strokes"
import { tiltedToolEnvelope } from "#/world/town/tilted-tool-envelope"
import { certifyWorkStrokeRoom } from "../../world/scene/figure/work-stroke-clearance"
import { nativeWorkStrokeEndpoints } from "../../world/scene/figure/work-stroke"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
import { RESIDENTS, RESIDENT_LOOKS } from "../../world/town/residents"
import { quarterTurnPoint } from "../../lib/engine/quarter-turn-point"
import { segmentCuboidDistance } from "../../lib/engine/segment-cuboid-distance"
import { cuboidTranslationHits } from "../../lib/engine/cuboid-translation-hits"
import { type Point3 } from "../../lib/engine/cuboid-motion-types"
import type { Cuboid } from "../../lib/engine/cuboid-subtraction"
import type { Vector3Tuple as V3 } from "../../lib/engine/vector3-types"
function fixture(id: string) {
  const read = (kind: string, name: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${name}.md`, import.meta.url), "utf8")),
    building = read("buildings", `building-${id}`),
    docs = new Map((building.rooms as string[]).map((id) => [id, read("rooms", id)])),
    room = docs.get(`room-${id}-1`)!,
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
    section = hearthRoomSection({ room: room, building: building, documents: docs, hearth: f }),
    tool = tiltedToolEnvelope({
      front: f.hearth_front!,
      width: op.tool.blade_width_m,
      thickness: op.tool.blade_thickness_m,
      length: op.tool.length_m,
      gripFromBlade: work.tilt.gripFromBlade,
      tilt: work.tilt.angle,
    }),
    look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => `resident-${r.name}` === op.operator)],
    grips: [V3, V3] = [[...work.strokes[0].grip], [...work.strokes[1].grip]],
    candidate = op.work_pose_candidate!
  return { look, candidate, grips, work, tool, section, check: () => certifyWorkStrokeRoom({ look: look, candidate: candidate, grips: grips, axis: work.axis, tool: tool, room: section }) }
}
it("certifies complete arm, cuff and tool room clearance for both source strokes", () => {
  for (const id of ["h-m5", "h10"]) expect(fixture(id).check().intervals).toBeGreaterThan(0)
})
it("rejects an actual intermediate arm intersection absent from both endpoints", () => {
  for (const id of ["h-m5", "h10"]) {
    const f = fixture(id)
    // Preserve the original intermediate-collision reproducer independently of later authored pose changes.
    if (id === "h-m5") f.candidate.body_m = [5.15, 1.9]
    const poses = nativeWorkStrokeEndpoints({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.work.axis }),
      base = poses[0],
      shoulder = base.skeleton.p[`upperarm_${f.candidate.hand}`],
      mid = poses[0].solution.grip.map((v, i) => (v + poses[1].solution.grip[i]) / 2) as V3,
      solution = solveArmGrip({ skeleton: base.skeleton, side: f.candidate.hand, target: mid, pole: f.candidate.pole })!,
      middle = nativeArmSurfaces({ scale: 1, shoulder: shoulder, elbow: solution.elbow, wrist: solution.wrist })
    const world = (p: V3): Point3 => {
        const [x, z] = quarterTurnPoint(p[0], p[2], base.turn)
        return [x + f.candidate.body_m[0], p[1] + base.rootY, z + f.candidate.body_m[1]]
      },
      capsules = poses.flatMap((p) => {
        const s = nativeArmSurfaces({ scale: 1, shoulder: shoulder, elbow: p.solution.elbow, wrist: p.solution.wrist })
        return [...s.arm.capsuleBounds(), ...s.cuff.capsuleBounds()]
      })
    let witness: Cuboid | undefined
    for (let x = -1; x <= 1 && !witness; x++)
      for (let y = -1; y <= 1 && !witness; y++)
        for (let z = -1; z <= 1 && !witness; z++) {
          const n = Math.hypot(x, y, z) || 1,
            local = solution.elbow.map((v, i) => v + ([x, y, z][i] / n) * 0.03) as V3,
            p = world(local),
            r = 0.001,
            box = { x0: p[0] - r, x1: p[0] + r, bottom: p[1] - r, top: p[1] + r, z0: p[2] - r, z1: p[2] + r }
          if (
            middle.arm.sd(local) < 0 &&
            capsules.every((c) => segmentCuboidDistance(box, world(c.a), world(c.b)) > c.r) &&
            !cuboidTranslationHits({ relative: f.tool, from: f.grips[0], to: f.grips[1], obstacle: box })
          )
            witness = box
        }
    expect(witness).toBeDefined()
    expect(() => certifyWorkStrokeRoom({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.work.axis, tool: f.tool, room: { ...f.section, obstacles: [witness!] } })).toThrow(
      "Working arm room clearance remains unresolved",
    )
  }
})
it("checks the tool's full translation and ceiling section", () => {
  const f = fixture("h10"),
    at = f.grips[0]
  expect(() =>
    certifyWorkStrokeRoom({
      look: f.look,
      candidate: f.candidate,
      grips: f.grips,
      axis: f.work.axis,
      tool: f.tool,
      room: {
        ...f.section,
        obstacles: [{ x0: at[0] - 0.02, x1: at[0] + 0.02, bottom: at[1] - 0.02, top: at[1] + 0.02, z0: at[2] - 0.02, z1: at[2] + 0.02 }],
      },
    }),
  ).toThrow("Working tool crosses")
  expect(() => certifyWorkStrokeRoom({ look: f.look, candidate: f.candidate, grips: f.grips, axis: f.work.axis, tool: f.tool, room: { ...f.section, ceiling: 0.1 } })).toThrow("Working tool crosses")
})
