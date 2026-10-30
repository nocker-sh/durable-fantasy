import * as THREE from "three"
import { expect, it } from "vitest"
import { addMeasuredBed } from "#/world/scene/construction/add-measured-bed"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { BedSpec } from "#/world/town/bed-types"
const bed: BedSpec = { frameHeight: 0.4, deckThickness: 0.025, railWidth: 0.05, railHeight: 0.12, legWidth: 0.06, headHeight: 0.8, mattressThickness: 0.1, headSide: "n", linen: null }

it("places the mattress on the frame and keeps the full measured headboard and feet", () => {
  const builder = new GB(),
    mattress = new THREE.MeshStandardMaterial()
  addMeasuredBed({ builder, at: [2, 3], size: [1, 2], floor: 0.2, bed, mattress })
  const root = builder.build(),
    mattressMesh = root.children.find((part) => part instanceof THREE.Mesh && part.material === mattress)
  if (!(mattressMesh instanceof THREE.Mesh)) throw new Error("Missing physical mattress")
  const top = new THREE.Box3().setFromObject(mattressMesh),
    full = new THREE.Box3().setFromObject(root)
  expect(top.min.toArray()).toEqual([expect.closeTo(1.55, 6), expect.closeTo(0.6, 6), expect.closeTo(2.05, 6)])
  expect(top.max.toArray()).toEqual([expect.closeTo(2.45, 6), expect.closeTo(0.7, 6), expect.closeTo(3.95, 6)])
  expect(full.min.toArray()).toEqual([expect.closeTo(1.5, 6), expect.closeTo(0.2, 6), 2])
  expect(full.max.toArray()).toEqual([expect.closeTo(2.5, 6), expect.closeTo(1, 6), 4])
  root.traverse((part) => {
    if (part instanceof THREE.Mesh) part.geometry.dispose()
  })
  mattress.dispose()
})
it("does not partially draw an invalid physical frame", () => {
  const builder = new GB(),
    mattress = new THREE.MeshStandardMaterial()
  expect(() => addMeasuredBed({ builder, at: [0, 0], size: [1, 2], floor: 0, bed: { ...bed, frameHeight: 0 }, mattress })).toThrow("Invalid bed dimensions")
  expect(builder.groups.size).toBe(0)
  mattress.dispose()
})

it("draws the same physical pillow and blanket as closed supported surfaces", () => {
  const builder = new GB(),
    mattress = new THREE.MeshStandardMaterial(),
    linen: NonNullable<BedSpec["linen"]> = [
      { id: "bed:pillow", kind: "pillow", across: 0.2, fromHead: 0.08, width: 0.5, length: 0.3, thickness: 0.08 },
      { id: "bed:blanket", kind: "blanket", across: 0.02, fromHead: 0.54, width: 0.86, length: 1.32, thickness: 0.025 },
    ]
  addMeasuredBed({ builder, at: [2, 3], size: [1, 2], floor: 0.2, bed: { ...bed, linen }, mattress })
  const root = builder.build()
  root.updateMatrixWorld(true)
  const pillow = new THREE.Raycaster(new THREE.Vector3(2, 2, 2.28), new THREE.Vector3(0, -1, 0)).intersectObject(root, true),
    blanket = new THREE.Raycaster(new THREE.Vector3(2, 2, 3), new THREE.Vector3(0, -1, 0)).intersectObject(root, true)
  expect(pillow[0].point.y).toBeCloseTo(0.78, 6)
  expect(blanket[0].point.y).toBeCloseTo(0.725, 6)
  root.traverse((part) => {
    if (part instanceof THREE.Mesh) part.geometry.dispose()
  })
  const invalidBuilder = new GB()
  expect(() => addMeasuredBed({ builder: invalidBuilder, at: [2, 3], size: [1, 2], floor: 0, bed: { ...bed, linen: [linen[0], { ...linen[1], width: 1.1 }] }, mattress })).toThrow(
    "leaves its container",
  )
  expect(invalidBuilder.groups.size).toBe(0)
  mattress.dispose()
})
