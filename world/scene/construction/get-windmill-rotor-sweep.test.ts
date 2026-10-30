import { expect, it } from "vitest"
import * as THREE from "three"
import { WINDMILL_ROTOR_SHAPE } from "#/world/scene/construction/windmill-rotor-shape"
import { getWindmillRotorSweep } from "#/world/scene/construction/get-windmill-rotor-sweep"
it("contains both real mesh geometries through every arm and a complete rotation", () => {
  const shape = WINDMILL_ROTOR_SHAPE,
    sweep = getWindmillRotorSweep({ shape })
  if (sweep instanceof Error) throw sweep
  const pieces = [
    { geometry: new THREE.BoxGeometry(...shape.beam.size), centre: shape.beam.centre },
    { geometry: new THREE.PlaneGeometry(...shape.sail.size), centre: shape.sail.centre },
  ]
  const axis = new THREE.Vector3(0, 0, 1)
  for (const piece of pieces) {
    const positions = piece.geometry.getAttribute("position")
    for (const step of Array.from({ length: 121 }).keys())
      for (const arm of Array.from({ length: shape.arms }).keys())
        for (const index of Array.from({ length: positions.count }).keys()) {
          const point = new THREE.Vector3().fromBufferAttribute(positions, index).add(new THREE.Vector3(...piece.centre))
          point.applyAxisAngle(axis, (step / 120 + arm / shape.arms) * Math.PI * 2).add(new THREE.Vector3(...shape.hub))
          expect(point.x).toBeGreaterThanOrEqual(sweep.bounds.x0 - 1e-6)
          expect(point.x).toBeLessThanOrEqual(sweep.bounds.x1 + 1e-6)
          expect(point.y).toBeGreaterThanOrEqual(sweep.bounds.bottom - 1e-6)
          expect(point.y).toBeLessThanOrEqual(sweep.bounds.top + 1e-6)
          expect(point.z).toBeGreaterThanOrEqual(sweep.bounds.z0 - 1e-6)
          expect(point.z).toBeLessThanOrEqual(sweep.bounds.z1 + 1e-6)
        }
    piece.geometry.dispose()
  }
})
it("includes the farthest cloth corner between sampled arm directions and keeps the beam's depth", () => {
  const shape = WINDMILL_ROTOR_SHAPE,
    sweep = getWindmillRotorSweep({ shape })
  if (sweep instanceof Error) throw sweep
  const corner = new THREE.Vector2(shape.sail.centre[0] + shape.sail.size[0] / 2, shape.sail.centre[1] + shape.sail.size[1] / 2)
  corner.rotateAround(new THREE.Vector2(), -Math.atan2(corner.y, corner.x))
  expect(sweep.bounds.x1).toBeCloseTo(shape.hub[0] + corner.x, 12)
  expect(sweep.bounds.z0).toBeCloseTo(shape.hub[2] + shape.beam.centre[2] - shape.beam.size[2] / 2, 12)
  expect(sweep.radius).toBeGreaterThan(shape.beam.size[1])
})
it("refuses invalid rotor dimensions rather than returning an empty or nonfinite reservation", () => {
  const shape = WINDMILL_ROTOR_SHAPE
  for (const invalid of [
    { ...shape, arms: 0 },
    { ...shape, angularSpeed: NaN },
    { ...shape, beam: { ...shape.beam, size: [0, 3, 0.1] } },
    { ...shape, sail: { ...shape.sail, centre: [0, Infinity, 0] } },
  ] satisfies (typeof shape)[])
    expect(getWindmillRotorSweep({ shape: invalid })).toBeInstanceOf(Error)
})
