import { expect, it } from "vitest"
import { handoffRotationEnvelope } from "#/world/town/handoff-rotation-envelope"
import { rectangleFace } from "#/lib/engine/rectangle-face"
it("contains the complete pitch of all tool corners, including the intermediate extremum", () => {
  for (const front of ["n", "s", "e", "w"] as const) {
    const box = handoffRotationEnvelope({ front: front, width: 0.18, thickness: 0.2, length: 1.1, gripFromBlade: 1, from: "work_vertical", to: "work_horizontal" }),
      [nx, nz] = rectangleFace({ x: 0, z: 0, width: 1, depth: 1, side: front }).outward
    for (let angle = 0; angle <= 90; angle++)
      for (const along of [-1, 0.1])
        for (const depth of [-0.1, 0.1])
          for (const across of [-0.09, 0.09]) {
            const t = (angle * Math.PI) / 180,
              y = along * Math.cos(t) - depth * Math.sin(t),
              normal = along * Math.sin(t) + depth * Math.cos(t),
              x = nx * normal - nz * across,
              z = nz * normal + nx * across
            expect(x).toBeGreaterThanOrEqual(box.x0 - 1e-9)
            expect(x).toBeLessThanOrEqual(box.x1 + 1e-9)
            expect(z).toBeGreaterThanOrEqual(box.z0 - 1e-9)
            expect(z).toBeLessThanOrEqual(box.z1 + 1e-9)
            expect(y).toBeGreaterThanOrEqual(box.bottom - 1e-9)
            expect(y).toBeLessThanOrEqual(box.top + 1e-9)
          }
    expect(box.bottom).toBeLessThan(-1)
  }
})

it("includes intermediate extrema when tilting a tool with a short handle tail", () => {
  const tilt = (80 * Math.PI) / 180
  for (const front of ["n", "s", "e", "w"] as const) {
    const box = handoffRotationEnvelope({ front: front, width: 0.18, thickness: 0.008, length: 1.001, gripFromBlade: 1, from: "work_horizontal", to: "work_sloped", tilt: tilt }),
      [nx, nz] = rectangleFace({ x: 0, z: 0, width: 1, depth: 1, side: front }).outward
    for (let angle = 0; angle <= 80; angle++)
      for (const along of [-1, 0.001])
        for (const depth of [-0.004, 0.004])
          for (const across of [-0.09, 0.09]) {
            const t = (angle * Math.PI) / 180,
              normal = along * Math.cos(t) - depth * Math.sin(t),
              y = along * Math.sin(t) + depth * Math.cos(t),
              x = nx * normal - nz * across,
              z = nz * normal + nx * across
            expect(x).toBeGreaterThanOrEqual(box.x0 - 1e-9)
            expect(x).toBeLessThanOrEqual(box.x1 + 1e-9)
            expect(z).toBeGreaterThanOrEqual(box.z0 - 1e-9)
            expect(z).toBeLessThanOrEqual(box.z1 + 1e-9)
            expect(y).toBeGreaterThanOrEqual(box.bottom - 1e-9)
            expect(y).toBeLessThanOrEqual(box.top + 1e-9)
          }
    expect(box.top).toBeGreaterThan(0.004)
  }
})
