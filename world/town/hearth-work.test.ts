import { expect, it } from "vitest"
import { hearthSpatialStrokes } from "#/world/town/hearth-spatial-strokes"
import { hearthWorkTilt } from "#/world/town/hearth-work-tilt"
import { rectangleFace } from "../../lib/engine/rectangle-face"
const spec = { height: 0.7, openingBottom: 0.06, openingTop: 0.48, openingWidth: 0.4, openingOffset: 0, chamberDepth: 0.9 },
  bounds = { x0: 0, z0: 0, x1: 1, z1: 1 }
it("fits the tilted blade's outer corners to both the floor and rear contact planes", () => {
  const tilt = hearthWorkTilt({ reach: 1, gripHeight: 0.35, floor: 0.06, thickness: 0.008 }),
    c = Math.cos(tilt.angle),
    s = Math.sin(tilt.angle)
  expect(tilt.angle).toBeGreaterThan(0)
  expect(tilt.gripFromBlade).toBeGreaterThan(1)
  expect(tilt.gripFromBlade * c + 0.004 * s).toBeCloseTo(1, 12)
  expect(tilt.gripFromBlade * s + 0.004 * c).toBeCloseTo(0.35 - 0.06, 12)
})
it("moves the grip with the blade for parallel strokes and keeps all four orientations clear", () => {
  for (const front of ["n", "s", "e", "w"] as const) {
    const face = rectangleFace({ x: 0.5, z: 0.5, width: 1, depth: 1, side: front }),
      [nx, nz] = face.outward,
      grip = [face.point[0] + nx * 0.1, face.point[1] + nz * 0.1] as const
    const work = hearthSpatialStrokes({ bounds: bounds, front: front, spec: spec, grip: grip, height: 0.35, width: 0.18, thickness: 0.008, length: 1.1 })
    expect(work.strokes).toHaveLength(2)
    expect(Math.hypot(...work.axis)).toBeCloseTo(1, 12)
    expect(work.axis[0] * nx + work.axis[2] * nz).toBeCloseTo(Math.cos(work.tilt.angle), 12)
    expect(work.axis[1]).toBeCloseTo(Math.sin(work.tilt.angle), 12)
    for (const p of work.strokes) {
      expect(p.bounds.bottom).toBeCloseTo(0.06, 12)
      const corners = [p.bounds.x0, p.bounds.x1].flatMap((x) => [p.bounds.z0, p.bounds.z1].map((z) => (x - face.point[0]) * nx + (z - face.point[1]) * nz))
      expect(Math.min(...corners)).toBeCloseTo(-0.9, 12)
      const across = -nz * (p.grip[0] - grip[0]) + nx * (p.grip[2] - grip[1])
      expect(across).toBeCloseTo(p.offset)
    }
  }
})
it("rejects height that needs a longer tool or clips the lintel, and invalid geometry", () => {
  expect(() => hearthSpatialStrokes({ bounds: bounds, front: "s", spec: spec, grip: [0.5, 1.1], height: 0.9, width: 0.18, thickness: 0.008, length: 1.1 })).toThrow("cannot reach")
  expect(() => hearthSpatialStrokes({ bounds: bounds, front: "s", spec: spec, grip: [0.5, 1.1], height: 0.6, width: 0.18, thickness: 0.008, length: 2 })).toThrow("clips the firebox opening")
  expect(() => hearthWorkTilt({ reach: 1, gripHeight: 0.01, floor: 0.06, thickness: 0.008 })).toThrow("Invalid")
})
