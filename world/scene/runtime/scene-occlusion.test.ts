import { expect, it } from "vitest"
import { Box3, BoxGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from "three"
import { SceneOcclusion } from "#/world/scene/runtime/scene-occlusion"

function fixture(options: { opaque?: boolean; preview?: boolean; min?: number } = {}) {
  const material = new MeshBasicMaterial()
  const mesh = new Mesh(new BoxGeometry(), material)
  const obj = new Group()
  obj.add(mesh)
  const entry = { obj, box: new Box3(new Vector3(-1, 0, 3), new Vector3(1, 2, 4)), fade: 1, min: options.min ?? 0.2, opaque: options.opaque ?? false }
  const camera = { position: new Vector3(0, 0.9, 0) }
  const me: { pos: [number, number]; fig: { root: { position: { y: number } } } } = { pos: [0, 10], fig: { root: { position: { y: 0 } } } }
  const occlusion = new SceneOcclusion({ occluders: [entry], camera, me, preview: options.preview ?? false })
  return { entry, material, camera, me, occlusion }
}

it("fades an intervening object without requesting the player's solid-occluder outline", () => {
  const f = fixture()
  expect(f.occlusion.update(0.05)).toBe(false)
  expect(f.entry.fade).toBeCloseTo(0.68)
  expect(f.material.opacity).toBeCloseTo(0.68)
  expect(f.material.transparent).toBe(true)
  expect(f.material.depthWrite).toBe(false)
})

it("keeps opaque buildings solid and reports the hidden player", () => {
  const f = fixture({ opaque: true })
  expect(f.occlusion.update(0.05)).toBe(true)
  expect(f.entry.fade).toBe(1)
  expect(f.material.opacity).toBe(1)
})

it("leaves preview materials and visibility untouched", () => {
  const f = fixture({ preview: true })
  expect(f.occlusion.update(0.05)).toBe(false)
  expect(f.entry.fade).toBe(1)
  expect(f.material.opacity).toBe(1)
})

it("snaps to the minimum, hides very faint objects and restores them when the camera moves", () => {
  const f = fixture({ min: 0.02 })
  f.occlusion.update(1)
  expect(f.entry.fade).toBe(0.02)
  expect(f.entry.obj.visible).toBe(false)
  f.camera.position.set(20, 0.9, 0)
  f.occlusion.update(1)
  expect(f.entry.fade).toBe(1)
  expect(f.entry.obj.visible).toBe(true)
  expect(f.material.transparent).toBe(false)
  expect(f.material.depthWrite).toBe(true)
})
