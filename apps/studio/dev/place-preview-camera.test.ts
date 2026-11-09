import { expect, it } from "vitest"
import { PerspectiveCamera, Vector3 } from "three"
import { placePreviewCamera } from "#/dev/place-preview-camera"

it("fits off-origin scene geometry after a resize and rotation without moving that geometry", () => {
  const frame = { centre: new Vector3(24, 1.81, 24), size: new Vector3(8.53, 3.62, 7.27) },
    before = JSON.stringify(frame)
  const camera = new PerspectiveCamera(24, 1, 0.05, 200)
  for (const aspect of [2.73, 0.4])
    for (const turn of [0, 0.6, Math.PI, Math.PI * 1.5]) {
      camera.aspect = aspect
      camera.updateProjectionMatrix()
      placePreviewCamera({ camera, frame, turn })
      camera.updateMatrixWorld(true)
      for (const x of [-0.5, 0.5])
        for (const y of [-0.5, 0.5])
          for (const z of [-0.5, 0.5]) {
            const corner = new Vector3(frame.centre.x + frame.size.x * x, frame.centre.y + frame.size.y * y, frame.centre.z + frame.size.z * z).project(camera)
            expect(Math.abs(corner.x)).toBeLessThanOrEqual(1 / 1.1 + 1e-10)
            expect(Math.abs(corner.y)).toBeLessThanOrEqual(1 / 1.1 + 1e-10)
            expect(Math.abs(corner.z)).toBeLessThanOrEqual(1)
          }
    }
  expect(JSON.stringify(frame)).toBe(before)
})

it("extends the far plane for large models instead of fitting their sides and clipping their backs", () => {
  const frame = { centre: new Vector3(24, 0, 24), size: new Vector3(1000, 120, 900) },
    camera = new PerspectiveCamera(24, 1, 0.05, 200)
  placePreviewCamera({ camera, frame, turn: 0.6 })
  camera.updateMatrixWorld(true)
  expect(camera.far).toBeGreaterThan(200)
  for (const x of [-0.5, 0.5])
    for (const y of [-0.5, 0.5])
      for (const z of [-0.5, 0.5]) expect(new Vector3(frame.centre.x + frame.size.x * x, frame.centre.y + frame.size.y * y, frame.centre.z + frame.size.z * z).project(camera).z).toBeLessThan(1)
})
