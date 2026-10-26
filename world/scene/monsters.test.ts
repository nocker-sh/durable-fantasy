import { afterEach, expect, it, vi } from "vitest"
import * as THREE from "three"
import { burst, updateMonsters, type MonsterView } from "./monsters"
import { slimeBody } from "./fields"
import { SPAWNS } from "../core/monsters"

vi.mock("./world", async (original) => ({ ...(await original<typeof import("./world")>()), isFree: () => true, walkH: () => 0 }))
afterEach(() => vi.restoreAllMocks())

function fixture() {
  const root = new THREE.Group()
  const body = slimeBody(0x8ac06a)
  root.add(body)
  const monster: MonsterView = { spawn: SPAWNS[0], body, pos: [30, 30], hp: 0, back: 99999, burst: null, label: {} as HTMLDivElement }
  const texture = (body.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshLambertMaterial>).material.map!
  return { root, monster, texture }
}

it("releases expired burst geometry and materials while retaining the shared creature texture", () => {
  const { root, monster, texture } = fixture()
  const geometry = vi.spyOn(THREE.BufferGeometry.prototype, "dispose")
  const material = vi.spyOn(THREE.Material.prototype, "dispose")
  const shared = vi.spyOn(texture, "dispose")
  burst(monster, root, 0)
  expect(root.children).toHaveLength(5)
  updateMonsters([monster], root, 1199)
  expect(geometry).not.toHaveBeenCalled()
  updateMonsters([monster], root, 1200)
  expect(root.children).toEqual([monster.body])
  expect(monster.burst).toBeNull()
  expect(geometry).toHaveBeenCalledTimes(4)
  expect(material).toHaveBeenCalledTimes(4)
  expect(shared).not.toHaveBeenCalled()
  updateMonsters([monster], root, 1300)
  expect(geometry).toHaveBeenCalledTimes(4)
})

it("cleans up an interrupted burst and does not retain resources over repeated fights", () => {
  const { root, monster, texture } = fixture()
  const geometry = vi.spyOn(THREE.BufferGeometry.prototype, "dispose")
  const material = vi.spyOn(THREE.Material.prototype, "dispose")
  const shared = vi.spyOn(texture, "dispose")
  burst(monster, root, 0)
  for (let i = 1; i <= 100; i++) {
    burst(monster, root, i)
    expect(root.children).toHaveLength(5)
  }
  expect(geometry).toHaveBeenCalledTimes(400)
  updateMonsters([monster], root, 1300)
  expect(root.children).toHaveLength(1)
  expect(geometry).toHaveBeenCalledTimes(404)
  expect(material).toHaveBeenCalledTimes(404)
  expect(shared).not.toHaveBeenCalled()
})
