import { expect, it } from "vitest"
import { workingToolGeometry } from "#/world/town/working-tool-geometry"
import { projectToolFrame } from "#/world/town/project-tool-frame"
import { workingToolGripProfile } from "#/world/town/working-tool-grip-profile"
import { hearthSpatialStrokes } from "#/world/town/hearth-spatial-strokes"
import { rectangleFace } from "../../lib/engine/rectangle-face"
const spec = { width: 0.18, thickness: 0.008, length: 1.1, gripFromBlade: 1.05, handleWidth: 0.006, bladeLength: 0.12 }
it("keeps the blade and narrow handle in an orthonormal frame for every hearth front", () => {
  for (const front of ["n", "e", "s", "w"] as const) {
    const g = workingToolGeometry(front, 0.3, spec)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(g.axes[i].reduce((sum, v, k) => sum + v * g.axes[j][k], 0)).toBeCloseTo(i === j ? 1 : 0, 12)
    const coordinates = [0.2, 0.3, -0.4] as const,
      point: [number, number, number] = [0, 0, 0]
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) point[i] += g.axes[j][i] * coordinates[j]
    projectToolFrame(g.axes, point).forEach((v, i) => expect(v).toBeCloseTo(coordinates[i], 12))
    const [blade, handle] = g.parts
    expect(blade.part).toBe("blade")
    expect(handle.part).toBe("handle")
    expect(blade.bounds.x1 - blade.bounds.x0).toBeCloseTo(0.18, 12)
    expect(handle.bounds.x1 - handle.bounds.x0).toBeCloseTo(0.006, 12)
    expect(handle.bounds.z1 - handle.bounds.z0).toBeCloseTo(0.006, 12)
    expect(handle.bounds.bottom).toBeLessThan(0)
    expect(handle.bounds.top).toBeGreaterThan(0)
    expect(blade.bounds.top).toBe(handle.bounds.bottom)
  }
})
it("uses the same working axis as the real firebox stroke", () => {
  for (const front of ["n", "e", "s", "w"] as const) {
    const f = rectangleFace({ x: 0.5, z: 0.5, width: 1, depth: 1, side: front }),
      grip = [f.point[0] + f.outward[0] * 0.1, f.point[1] + f.outward[1] * 0.1] as const,
      work = hearthSpatialStrokes({
        bounds: { x0: 0, z0: 0, x1: 1, z1: 1 },
        front: front,
        spec: { height: 0.7, openingBottom: 0.06, openingTop: 0.48, openingWidth: 0.4, openingOffset: 0, chamberDepth: 0.9 },
        grip: grip,
        height: 0.4,
        width: 0.18,
        thickness: 0.008,
        length: 1.1,
      })
    expect(workingToolGeometry(front, work.tilt.angle, { ...spec, gripFromBlade: work.tilt.gripFromBlade }).axes[1]).toEqual(work.axis)
  }
  expect(() => workingToolGeometry("n", 0, { ...spec, gripFromBlade: 0.1 })).toThrow("Invalid")
  expect(() => workingToolGeometry("n", NaN, spec)).toThrow("Invalid")
})

it("derives the grip opening from the stored handle and rejects a grip beyond it", () => {
  const tool = workingToolGeometry("n", 0.3, spec),
    profile = workingToolGripProfile(tool)
  expect(profile).toEqual({ across: tool.axes[0], halfWidth: spec.handleWidth / 2, halfDepth: spec.handleWidth / 2 })
  tool.parts[1].bounds.top = -0.01
  expect(() => workingToolGripProfile(tool)).toThrow("centred handle")
})
