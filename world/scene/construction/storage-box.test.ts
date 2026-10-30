import { M } from "./materials"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import * as THREE from "three"
import { readSetting } from "#/scripts/lib/read-setting"
import { shelfDimensions } from "../../../scripts/lib/shelf-dimensions"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import { shelfLidHandle } from "#/world/town/shelf-lid-handle"
import { storageBox } from "#/world/scene/construction/storage-box"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { SceneResources } from "../../../lib/graphics/scene-resources"
it("draws the owned box's interior and lid underside from the actual board dimensions", () => {
  const room = readSetting(readFileSync(new URL("../../../.docs/settings/rooms/room-h10-2.md", import.meta.url), "utf8")),
    f = room.furniture!.find((f) => f.symbol === "C")!,
    k = room.grid!.cell_m
  const s = shelfDimensions(f.shelf, f.rect[2] * k, f.rect[3] * k),
    item = s.items![0],
    bounds = shelfItemParts({ x: 0, z: 0, width: f.rect[2] * k, depth: f.rect[3] * k, floor: 0, shelf: s })[0]
  const gb = new GB()
  storageBox({ builder: gb, bounds: bounds, wall: item.wall!, lid: item.lid!, lift: item.lidLift! })
  const root = gb.build()
  root.updateMatrixWorld(true)
  try {
    const x = (bounds.x0 + bounds.x1) / 2,
      z = (bounds.z0 + bounds.z1) / 2,
      belowLid = bounds.y1 - item.lid! + item.lidLift! - 0.001
    const down = new THREE.Raycaster(new THREE.Vector3(x, belowLid, z), new THREE.Vector3(0, -1, 0))
    expect(down.intersectObject(root, true)[0]?.point.y).toBeCloseTo(bounds.y0 + item.wall!)
    const up = new THREE.Raycaster(new THREE.Vector3(x, bounds.y1, z), new THREE.Vector3(0, 1, 0))
    expect(up.intersectObject(root, true)[0]?.point.y).toBeCloseTo(bounds.y1 - item.lid! + item.lidLift!)
    const side = new THREE.Raycaster(new THREE.Vector3(x, bounds.y0 + 0.1, z), new THREE.Vector3(1, 0, 0))
    expect(side.intersectObject(root, true)[0]?.point.x).toBeCloseTo(bounds.x1 - item.wall!)
  } finally {
    new SceneResources(root).dispose()
  }
})

it("draws the authored ash receiver with iron inner faces and the same removable lid", () => {
  const room = readSetting(readFileSync(new URL("../../../.docs/settings/rooms/room-h-m5-1.md", import.meta.url), "utf8")),
    f = room.furniture!.find((f) => f.symbol === "R")!,
    k = room.grid!.cell_m,
    shelf = shelfDimensions(f.shelf, f.rect[2] * k, f.rect[3] * k),
    item = shelf.items![0],
    bounds = shelfItemParts({ x: 0, z: 0, width: f.rect[2] * k, depth: f.rect[3] * k, floor: 0, shelf: shelf })[0],
    gb = new GB()
  storageBox({ builder: gb, bounds: bounds, wall: item.wall!, lid: item.lid!, lift: item.lidLift!, material: item.boxMaterial, handle: shelfLidHandle(shelf, item) })
  const root = gb.build()
  root.updateMatrixWorld(true)
  try {
    const ray = new THREE.Raycaster(new THREE.Vector3((bounds.x0 + bounds.x1) / 2, bounds.y1, (bounds.z0 + bounds.z1) / 2), new THREE.Vector3(0, -1, 0)),
      hit = ray.intersectObject(root, true)[0]
    expect(hit?.point.y).toBeCloseTo(bounds.y0 + item.wall!)
    const mesh = hit!.object as THREE.Mesh,
      materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    expect(materials[hit!.face!.materialIndex]).toBe(M.iron)
    const handle = item.lidHandle!,
      centre = new THREE.Vector3((bounds.x0 + bounds.x1) / 2, bounds.y1 - handle.height + item.lidLift! + handle.height / 2, (bounds.z0 + bounds.z1) / 2),
      upThroughGrip = new THREE.Raycaster(centre, new THREE.Vector3(0, 1, 0)),
      downThroughGrip = new THREE.Raycaster(centre, new THREE.Vector3(0, -1, 0))
    expect(upThroughGrip.intersectObject(root, true)[0]?.point.y).toBeCloseTo(bounds.y1 + item.lidLift! - handle.thickness, 6)
    expect(downThroughGrip.intersectObject(root, true)[0]?.point.y).toBeCloseTo(bounds.y1 - handle.height + item.lidLift!, 6)
  } finally {
    new SceneResources(root).dispose()
  }
})
