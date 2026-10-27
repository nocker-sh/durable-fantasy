import { afterEach, expect, it, vi } from "vitest"
import * as THREE from "three"
import { critters, spawnAnimals, type Critter } from "./animals"
import * as terrain from "./world"
import type { V2 } from "./construction/registry.ts"

afterEach(() => {
  critters.length = 0
  vi.restoreAllMocks()
})

type Animal = Critter & { pos: V2; target: V2; wait: number }

it("keeps all town animals and their animation while reusing stationary terrain samples", () => {
  vi.spyOn(Math, "random").mockReturnValue(0.5)
  const ground = vi.spyOn(terrain, "walkH").mockImplementation((x, z) => x / 10 + z / 20)
  const root = new THREE.Group()
  spawnAnimals(root)
  expect(critters).toHaveLength(23)
  expect(critters.filter((c) => c.obj instanceof THREE.Sprite)).toHaveLength(12)
  const right = new THREE.Vector3(1, 0, 0)
  const animals = critters as Animal[]
  for (const animal of animals) animal.wait = 100
  const frames = new Set<THREE.Texture>()
  for (let i = 0; i < 120; i++) {
    for (const animal of animals) {
      animal.update(1 / 60, right)
      expect(animal.obj.position.y).toBeCloseTo(animal.pos[0] / 10 + animal.pos[1] / 20)
    }
    frames.add((animals[0].obj as THREE.Sprite).material.map!)
  }
  expect(ground).toHaveBeenCalledTimes(23)
  expect(frames.size).toBeGreaterThan(1)
  // Moving a sprite and a mesh resamples the terrain and retains the mesh's walking hop.
  for (const animal of [animals[0], animals[12]]) {
    animal.wait = 0
    animal.target = [animal.pos[0] + 1, animal.pos[1]]
    const before = animal.pos[0]
    animal.update(1 / 60, right)
    expect(animal.pos[0]).toBeGreaterThan(before)
    const groundY = animal.pos[0] / 10 + animal.pos[1] / 20
    if (animal.obj instanceof THREE.Sprite) expect(animal.obj.position.y).toBeCloseTo(groundY)
    else expect(animal.obj.position.y - groundY).toBeGreaterThan(0)
  }
  expect(ground).toHaveBeenCalledTimes(25)
})
