import { afterEach, expect, it } from "vitest"
import * as THREE from "three"
import { buildInterior } from "#/world/scene/build-interior"
import { cutaways } from "#/world/scene/interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { updateCutaways } from "#/world/scene/update-cutaways"
import { HOUSES } from "#/world/town/houses"
import { interiorPlan } from "#/world/town/interior-plan"
import { setLayout } from "#/world/scene/set-layout"
import { SceneResources } from "#/lib/graphics/scene-resources"
afterEach(() => {
  cutaways.length = 0
})
it("hides windows on a cut-away wall instead of leaving panes and frames floating", () => {
  setLayout(INDOOR)
  const root = new THREE.Group(),
    room = interiorPlan(HOUSES.find((house) => house.id === "h-c2")!)
  buildInterior(room)(root)
  const windows = root.getObjectByName("interior-windows")!,
    back = cutaways.find((wall) => wall.normal[1] === -1)!
  expect(back.details).toContain(windows)
  expect(root.getObjectByName("spinning-wheel")).toBeDefined()
  updateCutaways(new THREE.Vector3(back.at[0], 4, back.at[1] - 10))
  expect(windows.visible).toBe(false)
  updateCutaways(new THREE.Vector3(back.at[0], 4, back.at[1] + 10))
  expect(windows.visible).toBe(false)
  for (let frame = 0; frame < 30; frame++) updateCutaways(new THREE.Vector3(back.at[0], 4, back.at[1] + 10))
  expect(windows.visible).toBe(true)
  new SceneResources(root).dispose()
})
it("toggles only details belonging to the wall facing the camera", () => {
  const north = new THREE.Group(),
    east = new THREE.Group()
  cutaways.push({ obj: new THREE.Group(), at: [0, 0], normal: [0, -1], details: [north] }, { obj: new THREE.Group(), at: [0, 0], normal: [1, 0], details: [east] })
  updateCutaways(new THREE.Vector3(5, 3, 5))
  expect(north.visible).toBe(true)
  expect(east.visible).toBe(false)
  updateCutaways(new THREE.Vector3(-5, 3, -5))
  expect(north.visible).toBe(false)
  for (let frame = 0; frame < 30; frame++) updateCutaways(new THREE.Vector3(-5, 3, -5))
  expect(east.visible).toBe(true)
})

it("keeps meeting records above the measured tabletop instead of buried at the old fixed height", () => {
  setLayout(INDOOR)
  const root = new THREE.Group(),
    room = interiorPlan(HOUSES.find((house) => house.id === "h-m5")!)
  buildInterior(room)(root)
  root.updateMatrixWorld(true)
  const records = room.furniture.find((piece) => piece.name === "寄り合いの議事録")!
  const table = room.furniture.find((piece) => piece.name === "記録と教材を置く共用卓")!
  const ray = new THREE.Raycaster(new THREE.Vector3(records.x, 2, records.z), new THREE.Vector3(0, -1, 0))
  const floor = new THREE.Box3().setFromObject(root.getObjectByName("interior-floor")!).max.y
  expect(ray.intersectObject(root, true)[0]?.point.y).toBeCloseTo(floor + table.workSurface!.height + 0.08)
  new SceneResources(root).dispose()
})
