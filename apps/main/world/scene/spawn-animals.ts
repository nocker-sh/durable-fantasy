import type { Object3D } from "three"
import { townAnimalSpawns } from "#/world/town/animals"
import { createTownCritter } from "#/world/scene/create-town-critter"
import { critters } from "#/world/scene/critters"

/** Build only this map's existing animals and retain their identity for picking and scene cleanup. */
export function spawnAnimals(scene: Object3D, map = "phanthiet") {
  for (const spawn of townAnimalSpawns(map)) {
    const animal = createTownCritter({ scene, spawn })
    animal.obj.userData.animalId = spawn.id
    critters.push(animal)
  }
}
