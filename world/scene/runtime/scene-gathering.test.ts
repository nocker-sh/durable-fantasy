import { afterEach, expect, it, vi } from "vitest"
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three"
import { SceneGathering } from "#/world/scene/runtime/scene-gathering"
import type { NodeDef } from "#/world/core/gather-types"
import type { GatheringSpot } from "#/world/scene/runtime/gathering-types"
import type { Cell } from "#/world/scene/runtime/types"

const builders = vi.hoisted(() => ({
  node: vi.fn<(town: Group, node: Pick<NodeDef, "id" | "cell">) => GatheringSpot>(),
  station: vi.fn<(town: Group, station: { id: string; cell: Readonly<Cell> }) => GatheringSpot>(),
}))
vi.mock("#/world/scene/runtime/create-gathering-node", () => ({ createGatheringNode: builders.node }))
vi.mock("#/world/scene/runtime/create-station-spot", () => ({ createStationSpot: builders.station }))
vi.mock("#/world/core/gather", () => ({
  NODES: [
    { id: "herbs", map: "field", cell: [4, 8] },
    { id: "tree", map: "field", cell: [10, 8] },
    { id: "away", map: "other", cell: [0, 0] },
  ],
}))
vi.mock("#/world/town/stations", () => ({ STATIONS: [{ id: "bench", map: "field", cell: [8, 8] }] }))
vi.mock("#/world/town/boards", () => ({ EXCHANGE_BOARD: { map: "field", cell: [12, 8] } }))
afterEach(() => vi.clearAllMocks())

function makeSpot(town: Group, spot: { id: string; cell: Readonly<Cell> }, station = false): GatheringSpot {
  const at: [number, number] = [(spot.cell[0] + 0.5) / 2, (spot.cell[1] + 0.5) / 2]
  const full = new Group()
  full.userData.node = spot.id
  full.position.set(at[0], 0, at[1])
  full.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial()))
  const spent = new Group()
  spent.visible = station
  town.add(full, spent)
  return { full, spent, at }
}

function fixture() {
  builders.node.mockImplementation((town, node) => makeSpot(town, node))
  builders.station.mockImplementation((town, station) => makeSpot(town, { id: `station:${station.id}`, cell: station.cell }, true))
  const town = new Group()
  const gathering = new SceneGathering({ town, map: "field" })
  town.updateMatrixWorld(true)
  return { town, gathering }
}

it("builds only this map's nodes, then stations and the board in their original order", () => {
  const f = fixture()
  expect([...f.gathering.spots.keys()]).toEqual(["herbs", "tree", "station:bench", "station:exchange-board"])
  expect(builders.node).toHaveBeenCalledTimes(2)
  expect(builders.station).toHaveBeenCalledTimes(2)
  expect(f.town.children.map((child) => child.userData.node).filter(Boolean)).toEqual([...f.gathering.spots.keys()])
})

it("swaps depleted nodes, defaults omitted counts to present and leaves stations alone", () => {
  const f = fixture()
  f.gathering.setNodes({ herbs: 0, tree: -1, "station:bench": 0 })
  expect(f.town.children.map((child) => child.visible)).toEqual([false, true, false, true, true, true, true, true])
  f.gathering.setNodes({ herbs: 2 })
  expect(f.town.children.map((child) => child.visible)).toEqual([true, false, true, false, true, true, true, true])
})

it("resolves the first intersected child's tag through its parents and ignores spent nodes", () => {
  const f = fixture()
  const ray = new Raycaster(new Vector3(2.25, 10, 4.25), new Vector3(0, -1, 0))
  expect(f.gathering.spotHit(ray)).toBe("herbs")
  f.gathering.setNodes({ herbs: 0 })
  expect(f.gathering.spotHit(ray)).toBeNull()
})
