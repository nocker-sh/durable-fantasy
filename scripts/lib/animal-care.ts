import { roomHasWorker } from "#/scripts/lib/room-worker"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type AnimalCare = {
  kind: string
  population_ids: string[]
  keeper: string
  roosts: string[]
  nests: string[]
  feed: string
  water: string
  bedding: string
  waste: string
  egg_collection: string
  capacity_status: string
}
/** Animal identity and care fixtures are separate from residents' ordinary sleeping places. */
export function auditAnimalCare(documents: ReadonlyMap<string, SettingDocument>, animals: readonly { id: string; kind: string }[]): string[] {
  const errors: string[] = [],
    population = new Map(animals.map((animal) => [animal.id, animal.kind])),
    housed = new Set<string>()
  for (const room of documents.values()) {
    const care = room.animal_care as AnimalCare | undefined
    if (!care) continue
    const fail = (problem: string) => errors.push(`${room.id}: ${problem}`)
    if (room.kind !== "rooms" || !room.grid) {
      fail("Animal care has no room grid")
      continue
    }
    if (!roomHasWorker(room, care.keeper, documents)) fail("Animal keeper has no matching work assignment")
    for (const id of care.population_ids) {
      if (population.get(id) !== care.kind) fail(`Animal identity or kind does not match: ${id}`)
      if (housed.has(id)) fail(`Animal has more than one housing assignment: ${id}`)
      housed.add(id)
    }
    const fixtures: [string, string][] = [
      ...care.roosts.map((s): [string, string] => [s, "animal_roost"]),
      ...care.nests.map((s): [string, string] => [s, "animal_nest"]),
      [care.feed, "animal_feed"],
      [care.water, "animal_water"],
      [care.bedding, "clean_bedding"],
      [care.waste, "used_bedding"],
      [care.egg_collection, "egg_collection"],
    ]
    const used = new Set<string>()
    for (const entry of fixtures) {
      const symbol = entry[0]
      const role = entry[1]

      if (used.has(symbol)) fail("Animal-care furniture is assigned more than once")
      used.add(symbol)
      if (room.furniture?.find((f) => f.symbol === symbol)?.role !== role) fail(`Animal care has no matching ${role} furniture`)
    }
    if (room.design_gate === "通過" && care.capacity_status === "unverified") fail("Animal housing capacity and operation remain unverified")
  }
  return errors
}
