import { expect, it } from "vitest"
import { PerspectiveCamera, Vector3 } from "three"
import { getPerspectiveBoxDistance } from "#/lib/graphics/get-perspective-box-distance"
const frame = { size: [8.53, 3.62, 7.27] satisfies [number, number, number], outward: [0, 0.6, 0.8] satisfies [number, number, number], fovDegrees: 24, aspect: 2.73, padding: 1.1, near: 0.05 }

it("fits every corner through the actual projection for wide, square and narrow viewports through a full turn", () => {
  for (const size of [
    [8.53, 3.62, 7.27],
    [0.2, 12, 0.4],
    [20, 0, 8],
    [0, 0, 0],
  ] satisfies [number, number, number][])
    for (const aspect of [0.35, 1, 2.73])
      for (const turn of Array.from({ length: 16 }, (_, index) => (index * Math.PI) / 8)) {
        const props = { ...frame, size, aspect, outward: [Math.sin(turn) * 0.8, 0.6, Math.cos(turn) * 0.8] satisfies [number, number, number] },
          distance = getPerspectiveBoxDistance(props)
        if (distance instanceof Error) throw distance
        const camera = new PerspectiveCamera(props.fovDegrees, aspect, props.near, distance + new Vector3(...size).length() + 1)
        camera.position.copy(new Vector3(...props.outward).multiplyScalar(distance))
        camera.lookAt(0, 0, 0)
        camera.updateMatrixWorld(true)
        for (const x of [-0.5, 0.5])
          for (const y of [-0.5, 0.5])
            for (const z of [-0.5, 0.5]) {
              const projected = new Vector3(size[0] * x, size[1] * y, size[2] * z).project(camera)
              expect(Math.abs(projected.x)).toBeLessThanOrEqual(1 / props.padding + 1e-10)
              expect(Math.abs(projected.y)).toBeLessThanOrEqual(1 / props.padding + 1e-10)
              expect(projected.z).toBeGreaterThanOrEqual(-1 - 1e-10)
              expect(projected.z).toBeLessThan(1)
            }
      }
})

it("uses the room frame more closely than the former maximum-edge estimate and expands for a narrow viewport", () => {
  const distance = getPerspectiveBoxDistance(frame),
    oldDistance = (Math.max(...frame.size) * 0.9) / Math.tan((frame.fovDegrees * Math.PI) / 360) + Math.max(...frame.size) * 0.5
  if (distance instanceof Error) throw distance
  expect(distance).toBeLessThan(oldDistance * 0.75)
  const narrow = getPerspectiveBoxDistance({ ...frame, aspect: 0.35 })
  if (narrow instanceof Error) throw narrow
  expect(narrow).toBeGreaterThan(distance)
})

it("rejects invalid dimensions, view axes and unbounded arithmetic", () => {
  for (const invalid of [
    { aspect: 0 },
    { padding: 0.9 },
    { near: 0 },
    { fovDegrees: 180 },
    { fovDegrees: NaN },
    { size: [-1, 1, 1] satisfies [number, number, number] },
    { outward: [0, 0, 0] satisfies [number, number, number] },
    { outward: [0, 1, 0] satisfies [number, number, number] },
  ])
    expect(getPerspectiveBoxDistance({ ...frame, ...invalid })).toBeInstanceOf(Error)
  expect(getPerspectiveBoxDistance({ ...frame, size: [Number.MAX_VALUE, 1, 1], aspect: Number.MIN_VALUE })).toBeInstanceOf(Error)
})
