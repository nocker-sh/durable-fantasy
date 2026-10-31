import { expect, it, vi } from "vitest"
import { Vector3 } from "three"
import { createSceneCamera } from "#/world/scene/runtime/create-scene-camera"
import { resizeSceneViewport } from "#/world/scene/runtime/resize-scene-viewport"

function viewport() {
  return { renderer: { setPixelRatio: vi.fn(), setSize: vi.fn(), domElement: { style: { width: "", height: "" } } }, post: { resize: vi.fn() } }
}

it("rounds render pixels up together without changing display dimensions", () => {
  const target = viewport()
  resizeSceneViewport({ ...target, width: 801, height: 603, scale: 2 })
  expect(target.renderer.setPixelRatio).toHaveBeenCalledExactlyOnceWith(1)
  expect(target.renderer.setSize).toHaveBeenCalledExactlyOnceWith(401, 302, false)
  expect(target.post.resize).toHaveBeenCalledExactlyOnceWith(401, 302)
  expect(target.renderer.domElement.style).toEqual({ width: "801px", height: "603px" })
})

it("connects ordinary camera resizing and zoom to the same render and postprocessing dimensions", () => {
  const target = viewport()
  const position = new Vector3(1, 2, 3)
  const camera = createSceneCamera({ viewport: target, position, preview: false, zoom: 2 })
  expect(camera.focus.toArray()).toEqual([1, 2, 3])
  expect(camera.focus).not.toBe(position)
  expect(camera.zoomLevel()).toEqual({ level: 0, max: 1 })
  camera.resize(801, 603)
  expect(target.renderer.setSize).toHaveBeenLastCalledWith(801, 603, false)
  camera.zoom(1)
  expect(target.renderer.setSize).toHaveBeenLastCalledWith(401, 302, false)
  expect(target.post.resize).toHaveBeenLastCalledWith(401, 302)
  expect(target.renderer.domElement.style).toEqual({ width: "801px", height: "603px" })
  expect(camera.camera.aspect).toBe(801 / 603)
})

it("retains the wider preview zoom range and its initial level", () => {
  const target = viewport()
  const camera = createSceneCamera({ viewport: target, position: new Vector3(), preview: true })
  expect(camera.zoomLevel()).toEqual({ level: 1, max: 2 })
  camera.resize(801, 603)
  camera.zoom(-1)
  expect(target.renderer.setSize).toHaveBeenLastCalledWith(1602, 1206, false)
  expect(target.post.resize).toHaveBeenLastCalledWith(1602, 1206)
})
