import { expect, it } from "vitest"
import * as THREE from "three"
import { pottersWheel } from "#/world/scene/construction/potters-wheel"
import { whetstone } from "#/world/scene/construction/whetstone"
import { SceneResources } from "#/lib/graphics/scene-resources"
import type { Furniture } from "#/world/town/interiors"
it.each(["potter", "stone"] as const)("supports the %s tool inside its existing footprint", (kind) => {
  const f: Furniture = { kind: "whetstone", x: 12, z: 18, w: 1.35, d: 1.35, solid: true },
    floor = 0.3
  const root = kind === "potter" ? pottersWheel(f, floor) : whetstone(f, floor),
    box = new THREE.Box3().setFromObject(root)
  expect(box.min.x).toBeGreaterThanOrEqual(f.x - f.w / 2 - 1e-6)
  expect(box.max.x).toBeLessThanOrEqual(f.x + f.w / 2 + 1e-6)
  expect(box.min.z).toBeGreaterThanOrEqual(f.z - f.d / 2 - 1e-6)
  expect(box.max.z).toBeLessThanOrEqual(f.z + f.d / 2 + 1e-6)
  expect(box.min.y).toBeCloseTo(floor)
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) expect(Array.from(object.geometry.getAttribute("position").array).every(Number.isFinite)).toBe(true)
  })
  if (kind === "potter") {
    const upper = root.getObjectByName("throwing-head")!,
      lower = root.getObjectByName("kick-wheel")!,
      vessel = root.getObjectByName("forming-vessel")!
    const top = new THREE.Box3().setFromObject(upper),
      bottom = new THREE.Box3().setFromObject(lower),
      pot = new THREE.Box3().setFromObject(vessel)
    expect(top.min.y).toBeGreaterThan(bottom.max.y)
    const base = new THREE.Box3().setFromObject(root.getObjectByName("bearing-base")!)
    expect(bottom.min.y).toBeGreaterThan(base.max.y)
    expect(pot.min.y).toBeCloseTo(top.max.y)
  } else for (const grade of ["coarse-stone", "medium-stone", "finishing-stone"]) expect(root.getObjectByName(grade)).toBeDefined()
  new SceneResources(root).dispose()
})
it.each([
  [0.9, 0.75],
  [0.75, 0.9],
])("aligns the wet stone with the longer %s by %s work surface", (w, d) => {
  const f: Furniture = { kind: "whetstone", x: 0, z: 0, w, d, solid: true },
    root = whetstone(f, 0),
    size = new THREE.Box3().setFromObject(root.getObjectByName("sharpening-stone")!).getSize(new THREE.Vector3())
  expect(size.x > size.z).toBe(w > d)
  new SceneResources(root).dispose()
})
