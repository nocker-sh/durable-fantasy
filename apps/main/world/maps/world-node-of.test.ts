import { expect, it, vi } from "vitest"
import type { MapDefinition } from "#/world/maps/types"
import { INTERIORS } from "#/world/town/interiors"
import { WORLD_NODES } from "#/world/maps/world-map"
import { worldNodeOf } from "#/world/maps/world-node-of"

vi.mock("#/world/maps", async (original) => {
  const current = await original<{ MAPS: Record<string, MapDefinition> }>()
  const base = current.MAPS["phanthiet-in-h-m5"]
  if (!base) throw new Error("Missing indoor fixture")
  const withLinks = (id: string, destinations: ReadonlyArray<string>): MapDefinition => ({
    ...base,
    id,
    warps: destinations.map((map) => ({ at: [0, 0], to: { map, at: [0, 0] } })),
  })
  return {
    ...current,
    MAPS: {
      ...current.MAPS,
      "test-cycle-a": withLinks("test-cycle-a", ["test-cycle-b"]),
      "test-cycle-b": withLinks("test-cycle-b", ["test-cycle-a"]),
      "test-branch": withLinks("test-branch", ["test-cycle-a", base.id]),
      "test-missing": withLinks("test-missing", ["missing-destination"]),
    },
  }
})

it("keeps every outdoor node and leaves an unknown map unmarked", () => {
  for (const node of WORLD_NODES) expect(worldNodeOf(node.id)).toBe(node)
  expect(worldNodeOf("unknown-map")).toBeUndefined()
})
it("resolves every indoor floor to its building's street", () => {
  for (const interior of INTERIORS) expect(worldNodeOf(interior.id)?.id, interior.id).toBe(interior.house.map)
})
it("finds the street beyond a cyclic branch and stops at missing or closed indoor connections", () => {
  const building = INTERIORS.find((interior) => interior.id === "phanthiet-in-h-m5")
  if (!building) throw new Error("Missing building fixture")
  expect(worldNodeOf("test-branch")?.id).toBe(building.house.map)
  expect(worldNodeOf("test-cycle-a")).toBeUndefined()
  expect(worldNodeOf("test-missing")).toBeUndefined()
})
