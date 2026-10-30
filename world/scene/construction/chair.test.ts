import { expect, it } from "vitest"
import * as THREE from "three"
import { chair } from "#/world/scene/construction/chair"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { INTERIORS } from "#/world/town/interiors"
import { SceneResources } from "#/lib/graphics/scene-resources"

it("keeps every classroom chair in its footprint and puts the seat at its projected height", () => {
  const room = INTERIORS.find((room) => room.id === "phanthiet-in-h-m5")!
  const chairs = room.furniture.filter((piece) => piece.kind === "chair")
  expect(chairs).toHaveLength(9)
  for (const piece of chairs) {
    const builder = new GB()
    chair(builder, piece, 0.02)
    const group = builder.build(),
      bounds = new THREE.Box3().setFromObject(group)
    expect(bounds.min.x).toBeGreaterThanOrEqual(piece.x - piece.w / 2)
    expect(bounds.max.x).toBeLessThanOrEqual(piece.x + piece.w / 2)
    expect(bounds.min.z).toBeGreaterThanOrEqual(piece.z - Math.max(piece.d / 2, piece.seat!.footRest ? piece.seat!.footRest.forward + piece.seat!.footRest.depth / 2 : 0) - 1e-6)
    expect(bounds.max.z).toBeLessThanOrEqual(piece.z + piece.d / 2)
    expect(bounds.min.y).toBeCloseTo(0.02)
    expect(bounds.max.y).toBeCloseTo(0.02 + 0.9 * 1.5)
    group.updateMatrixWorld(true)
    const ray = new THREE.Raycaster(new THREE.Vector3(piece.x, 2, piece.z), new THREE.Vector3(0, -1, 0))
    expect(ray.intersectObject(group, true)[0]?.point.y).toBeCloseTo(0.02 + 0.44 * 1.5)
    new SceneResources(group).dispose()
  }
})

it("places the back opposite the facing direction for all four authored orientations", () => {
  for (const [facing, dx, dz] of [
    ["n", 0, -1],
    ["s", 0, 1],
    ["w", -1, 0],
    ["e", 1, 0],
  ] as const) {
    const gb = new GB(),
      seat = { facing, width: 0.4, depth: 0.5, height: 0.44, backHeight: 0.88, boardThickness: 0.04, legWidth: 0.04 }
    chair(gb, { kind: "chair", solid: true, x: 1, z: 2, w: 0.6, d: 0.6, seat }, 0)
    const group = gb.build()
    group.updateMatrixWorld(true)
    try {
      const ray = new THREE.Raycaster(new THREE.Vector3(1 + dx, 0.7, 2 + dz), new THREE.Vector3(-dx, 0, -dz))
      expect(ray.intersectObject(group, true)[0]?.distance, facing).toBeCloseTo(1 + seat.depth / 2 - seat.legWidth)
      const bounds = new THREE.Box3().setFromObject(group)
      expect(bounds.max.x - bounds.min.x).toBeCloseTo(dx ? seat.depth : seat.width)
      expect(bounds.max.z - bounds.min.z).toBeCloseTo(dz ? seat.depth : seat.width)
    } finally {
      new SceneResources(group).dispose()
    }
  }
})
