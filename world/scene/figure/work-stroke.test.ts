import { workingToolGeometry } from "#/world/town/working-tool-geometry"
import { workingToolGripProfile } from "#/world/town/working-tool-grip-profile"
import { shelfDimensions } from "../../../scripts/lib/shelf-dimensions"
import { addVector3 as add } from "../../../lib/engine/add-vector3"
import { scaleVector3 as mul } from "../../../lib/engine/scale-vector3"
import { crossVector3 as cross } from "../../../lib/engine/cross-vector3"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { nativeWorkStrokeEndpoints } from "./work-stroke"
import { RESIDENTS, RESIDENT_LOOKS } from "../../town/residents"
import { readSetting } from "#/scripts/lib/read-setting"
import { hearthDimensions } from "../../../scripts/lib/hearth-dimensions"
import { hearthSpatialStrokes } from "#/world/town/hearth-spatial-strokes"
function fixture(id: string) {
  const room = readSetting(readFileSync(new URL(`../../../.docs/settings/rooms/room-${id}-1.md`, import.meta.url), "utf8")),
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
    look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => `resident-${r.name}` === op.operator)]
  const rack = room.furniture!.find((f) => f.symbol === op.tool.storage!.furniture)!,
    shelf = shelfDimensions(rack.shelf, rack.rect[2] * k, rack.rect[3] * k),
    item = shelf.items!.find((i) => i.id === op.tool.storage!.item)!,
    geometry = workingToolGeometry(f.hearth_front!, work.tilt.angle, { width: item.width, thickness: item.depth, length: item.height, gripFromBlade: work.tilt.gripFromBlade, ...item.tool! }),
    profile = workingToolGripProfile(geometry)
  return {
    op,
    work,
    look,
    profile,
    check: () => nativeWorkStrokeEndpoints({ look: look, candidate: op.work_pose_candidate!, grips: [[...work.strokes[0].grip], [...work.strokes[1].grip]], axis: work.axis }),
  }
}
it("keeps both feet, the planted knee and every body joint except the working arm fixed", () => {
  for (const id of ["h-m5", "h10"]) {
    const f = fixture(id),
      [a, b] = f.check(),
      hand = f.op.work_pose_candidate!.hand
    expect(a.footing).toEqual(b.footing)
    expect(a.rootY).toBe(b.rootY)
    expect(a.body.knees).toEqual(b.body.knees)
    for (const bone of Object.keys(a.skeleton.p) as (keyof typeof a.skeleton.p)[]) if (bone !== `lowerarm_${hand}` && bone !== `hand_${hand}`) expect(a.skeleton.p[bone]).toEqual(b.skeleton.p[bone])
  }
})
it("rejects the old hall body position instead of sliding its support points", () => {
  const f = fixture("h-m5")
  f.op.work_pose_candidate!.body_m = [5, 1.95]
  expect(f.check).toThrow("unreachable")
})

it("keeps the actual rendered grip in the hand material and outside the cuff at both working ends", () => {
  for (const id of ["h-m5", "h10"]) {
    const f = fixture(id)
    for (const pose of f.check()) {
      const grip = pose.solution.grip,
        containing = pose.body.armParts[f.op.work_pose_candidate!.hand].filter((p) => p.sd!(grip) < 0)
      expect(containing).toHaveLength(1)
      expect(containing[0].m(grip, [0, 1, 0], [0, 1, 0])[0]).toBe(f.look.gloves ?? f.look.skin)
    }
  }
})

it("renders the stored handle's four contact faces in both authored work candidates", () => {
  for (const id of ["h-m5", "h10"]) {
    const f = fixture(id),
      candidate = f.op.work_pose_candidate!
    const poses = nativeWorkStrokeEndpoints({ look: f.look, candidate: candidate, grips: [[...f.work.strokes[0].grip], [...f.work.strokes[1].grip]], axis: f.work.axis, profile: f.profile })
    for (const pose of poses) {
      const profile = pose.skeleton.handGrips![candidate.hand]!,
        normal = cross(profile.across, profile.axis),
        parts = pose.body.armParts[candidate.hand],
        grip = pose.solution.grip
      expect(parts.every((p) => p.sd!(grip) > 0)).toBe(true)
      for (const [direction, half] of [
        [profile.across, profile.halfWidth],
        [normal, profile.halfDepth],
      ] as const)
        for (const sign of [-1, 1]) {
          const face = add(grip, mul(direction, sign * half)),
            arm = parts[0]
          expect(arm.sd!(face)).toBeCloseTo(0, 12)
          expect(arm.m(face, normal, normal)[0]).toBe(f.look.gloves ?? f.look.skin)
          expect(arm.sd!(add(grip, mul(direction, sign * (half + 0.0001))))).toBeLessThan(0)
          expect(arm.sd!(add(grip, mul(direction, sign * (half - 0.0001))))).toBeGreaterThan(0)
        }
    }
  }
})
