import { Rng } from "../../lib/engine/random"
import type { TownAnimalSpawn } from "#/world/town/animal-types"
/** Existing town population; definitions stay independent of meshes and sprite generation. */
export function townAnimalSpawns(map?: string): TownAnimalSpawn[] {
  const spawns: TownAnimalSpawn[] = [],
    random = new Rng(5)
  const add = (animal: Omit<TownAnimalSpawn, "map">) => spawns.push({ ...animal, map: "phanthiet" })
  for (let i = 0; i < 9; i++) add({ id: `hen-${i + 1}`, kind: "hen", variant: i, area: i < 6 ? [36.2, 17.9, 40.2, 21.5] : [17, 20.6, 22, 23], speed: 0.7, scale: 0.75 })
  const catAreas: [number, number, number, number][] = [
    [14.4, 21.8, 17.4, 23.4],
    [20, 26.6, 24, 28],
    [12, 32, 17, 33.4],
  ]
  for (const cat of catAreas.entries()) add({ id: `cat-${cat[0] + 1}`, kind: "cat", variant: cat[0], area: cat[1], speed: 0.9, scale: 0.7 })
  for (let i = 0; i < 4; i++) add({ id: `pig-${i + 1}`, kind: "pig", variant: 0, area: [36.6, 26, 40, 29], speed: 0.35 + random.next() * 0.2, scale: 0.75 })
  for (let i = 0; i < 7; i++) add({ id: `sheep-${i + 1}`, kind: "sheep", variant: 0, area: [42.6, 30.6, 46.8, 40.3], speed: 0.3 + random.next() * 0.15, scale: 0.85 })
  return map === undefined ? spawns : spawns.filter((animal) => animal.map === map)
}
