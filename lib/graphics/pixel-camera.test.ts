import * as THREE from "three"
import { expect, it, vi } from "vitest"
import { PixelCamera } from "#/lib/graphics/pixel-camera"

it("keeps the pixel scale and projection consistent when resizing and zooming", () => {
  const resize = vi.fn()
  const camera = new PixelCamera({ position: new THREE.Vector3(2, 3, 4), pitch: 0.82, pixelsPerUnit: 48, onResize: resize })
  camera.resize(800, 600)
  const distance = camera.distance
  expect(resize).toHaveBeenLastCalledWith(800, 600, 1)
  expect(camera.camera.aspect).toBeCloseTo(800 / 600)
  camera.zoom(1)
  expect(resize).toHaveBeenLastCalledWith(800, 600, 2)
  expect(camera.distance).toBeCloseTo(distance / 2)
  expect(camera.zoomLevel()).toEqual({ level: 1, max: 3 })
  camera.zoom(1)
  camera.zoom(1)
  expect(resize).toHaveBeenLastCalledWith(800, 600, 4)
  expect(camera.distance).toBeCloseTo(distance / 4)
  camera.zoom(1)
  expect(camera.zoomLevel().level).toBe(3)
})

it("holds the central region still and follows a turn around the same focus", () => {
  const camera = new PixelCamera({ position: new THREE.Vector3(0, 0, 0), pitch: 0.82, pixelsPerUnit: 48, onResize: () => {} })
  camera.resize(800, 600)
  camera.update({ meAt: new THREE.Vector3(0, 0, 0), yaw: 0, turned: false, dt: 1 / 60 })
  expect(camera.focus.toArray()).toEqual([0, 0, 0])
  camera.update({ meAt: new THREE.Vector3(0, 0, 0), yaw: Math.PI / 2, turned: true, dt: 1 / 60 })
  expect(camera.focus.toArray()).toEqual([0, 0, 0])
  expect(camera.camera.position.x).toBeGreaterThan(0)
  expect(camera.camera.position.z).toBeCloseTo(0)
})

it.each([1.5, Number.NaN, -3, 99])("keeps a usable zoom level for a level read from a query (%s)", (level) => {
  const camera = new PixelCamera({ position: new THREE.Vector3(0, 0, 0), pitch: 0.82, pixelsPerUnit: 48, onResize: () => {}, level })
  camera.resize(800, 600)
  expect(Number.isInteger(camera.zoomLevel().level)).toBe(true)
  expect(Number.isFinite(camera.distance)).toBe(true)
  expect(camera.scale).toBeGreaterThan(0)
})
