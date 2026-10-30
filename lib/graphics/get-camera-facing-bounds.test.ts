import { expect, it } from "vitest"
import { Box3, BoxGeometry, Group, Mesh, PerspectiveCamera, Sprite, Vector3 } from "three"
import { getCameraFacingBounds } from "#/lib/graphics/get-camera-facing-bounds"
import { getPerspectiveBoxDistance } from "#/lib/graphics/get-perspective-box-distance"

it("retains exact ordinary geometry bounds and does not mutate the scene", () => {
  const root = new Group(),
    mesh = new Mesh(new BoxGeometry(2, 3, 4))
  mesh.position.set(24, 1.5, 24)
  root.add(mesh)
  const bounds = new Box3().setFromObject(root)
  expect(getCameraFacingBounds(root)).toEqual(bounds)
  expect(root.children).toEqual([mesh])
})

it("encloses bottom-anchored, rotated and scaled billboard corners where a fixed plane's box misses them", () => {
  for (const anchor of [
    [0.5, 0],
    [0.5, 0.5],
    [1, 1],
  ]) {
    const root = new Group(),
      sprite = new Sprite()
    root.position.set(24, 2, 24)
    root.rotation.y = 0.6
    root.scale.set(2, 3, 2)
    sprite.center.set(anchor[0], anchor[1])
    sprite.scale.set(2, 4, 1)
    root.add(sprite)
    const bounds = getCameraFacingBounds(root),
      size = bounds.getSize(new Vector3()),
      centre = bounds.getCenter(new Vector3()),
      spriteAt = sprite.getWorldPosition(new Vector3()),
      scale = sprite.getWorldScale(new Vector3())
    for (const turn of [0, 0.6, 1.5, 3, 4.5]) {
      const outward = new Vector3(Math.sin(turn) * 0.8, 0.6, Math.cos(turn) * 0.8),
        right = new Vector3().crossVectors(new Vector3(0, 1, 0), outward).normalize(),
        up = new Vector3().crossVectors(outward, right)
      const distance = getPerspectiveBoxDistance({ size: [size.x, size.y, size.z], outward: [outward.x, outward.y, outward.z], fovDegrees: 24, aspect: 0.7, padding: 1.1, near: 0.05 })
      if (distance instanceof Error) throw distance
      const camera = new PerspectiveCamera(24, 0.7, 0.05, distance + size.length())
      camera.position.copy(centre).addScaledVector(outward, distance)
      camera.lookAt(centre)
      camera.updateMatrixWorld(true)
      for (const rotation of [0, Math.PI / 4])
        for (const x of [0, 1])
          for (const y of [0, 1]) {
            const localX = (x - sprite.center.x) * scale.x,
              localY = (y - sprite.center.y) * scale.y
            const corner = spriteAt
              .clone()
              .addScaledVector(right, localX * Math.cos(rotation) - localY * Math.sin(rotation))
              .addScaledVector(up, localX * Math.sin(rotation) + localY * Math.cos(rotation))
            expect(bounds.containsPoint(corner)).toBe(true)
            const projected = corner.project(camera)
            expect(Math.abs(projected.x)).toBeLessThanOrEqual(1 / 1.1 + 1e-10)
            expect(Math.abs(projected.y)).toBeLessThanOrEqual(1 / 1.1 + 1e-10)
          }
    }
  }
})
