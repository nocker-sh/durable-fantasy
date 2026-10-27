import { afterEach, expect, it, vi } from "vitest"
import * as THREE from "three"
import { burst, updateMonsterHealth, updateMonsters, type MonsterView } from "./monsters"
import * as terrain from "./world"
import { slimeBody } from "./fields"
import { SPAWNS, MONSTER_KINDS, MonsterMotion } from "../core/monsters"

vi.mock("./world", async (original) => ({ ...(await original<typeof import("./world")>()), isFree: () => true, walkH: () => 0 }))
afterEach(() => vi.restoreAllMocks())

function fixture() {
  const root = new THREE.Group()
  const body = slimeBody(0x8ac06a)
  root.add(body)
  const monster: MonsterView = {
    spawn: SPAWNS[0],
    motion: new MonsterMotion(SPAWNS[0], () => true),
    body,
    pos: [30, 30],
    hp: 0,
    back: 99999,
    burst: null,
    label: {} as HTMLDivElement,
    hpBar: { style: {} } as HTMLElement,
  }
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

it("turns at the same speed at 30 and 60 fps", () => {
  const turn = (fps: number) => {
    const { root, monster } = fixture()
    monster.hp = 30
    monster.back = 0
    let now = 0
    while (monster.motion.at(now).moving) now += 100
    for (let frame = 0; frame < fps; frame++) updateMonsters([monster], root, now, 1, 1 / fps)
    return monster.body.rotation.y
  }
  expect(turn(60)).toBeCloseTo(turn(30), 12)
})

it("reuses standing terrain height and position storage while preserving animation", () => {
  const { root, monster } = fixture()
  monster.hp = 30
  monster.back = 0
  const motion = vi.spyOn(monster.motion, "at").mockReturnValue({ x: 30, z: 30, moving: false })
  const height = vi.spyOn(terrain, "walkH").mockImplementation((x, z) => x / 10 + z / 20)
  const position = monster.pos
  for (let frame = 0; frame < 60; frame++) {
    const now = (frame * 1000) / 60
    updateMonsters([monster], root, now)
    expect(monster.body.position.y).toBeCloseTo(4.56)
    expect(monster.body.scale.y).toBeCloseTo((1 + Math.sin(now / 700 + monster.body.id) * 0.035) * (MONSTER_KINDS[monster.spawn.kind].size ?? 1))
  }
  expect(height).toHaveBeenCalledTimes(1)
  expect(monster.pos).toBe(position)
  motion.mockReturnValue({ x: 31, z: 30, moving: true })
  updateMonsters([monster], root, 1000)
  expect(height).toHaveBeenCalledTimes(2)
  expect(monster.body.position.y).toBeCloseTo(4.6 + 0.06 + Math.abs(Math.sin(1000 / 220)) * 0.09)
})

it("shares one ground sample among burst pieces and resamples after hidden movement", () => {
  const { root, monster } = fixture()
  const motion = vi.spyOn(monster.motion, "at").mockReturnValue({ x: 30, z: 30, moving: false })
  const height = vi.spyOn(terrain, "walkH").mockReturnValue(2)
  burst(monster, root, 0)
  updateMonsters([monster], root, 600)
  expect(height).toHaveBeenCalledTimes(1)
  for (const bit of monster.burst!.bits) expect(bit.position.y).toBeCloseTo(2.45)
  updateMonsters([monster], root, 1200)
  motion.mockReturnValue({ x: 32, z: 30, moving: false })
  updateMonsters([monster], root, 1300)
  expect(height).toHaveBeenCalledTimes(1)
  monster.hp = 30
  monster.back = 0
  height.mockReturnValue(3)
  updateMonsters([monster], root, 1400)
  expect(height).toHaveBeenCalledTimes(2)
  expect(monster.body.position.y).toBeCloseTo(3.06)
})

it("writes a monster HP bar only when its displayed percentage changes", () => {
  const { monster } = fixture()
  const widths: string[] = []
  monster.hpBar = {
    style: {
      set width(value: string) {
        widths.push(value)
      },
    },
  } as HTMLElement
  const max = MONSTER_KINDS[monster.spawn.kind].hp
  monster.hp = max
  for (let frame = 0; frame < 60; frame++) updateMonsterHealth(monster)
  expect(widths).toEqual(["100%"])
  monster.hp = max / 2
  updateMonsterHealth(monster)
  monster.hp = max * 0.501
  updateMonsterHealth(monster)
  expect(widths).toEqual(["100%", "50%"])
  monster.hp = 0
  updateMonsterHealth(monster)
  monster.hp = max
  updateMonsterHealth(monster)
  expect(widths).toEqual(["100%", "50%", "0%", "100%"])
})

it("skips invisible recovery frames and resumes at the current clock position", () => {
  const { root, monster } = fixture()
  const motion = vi.spyOn(monster.motion, "at")
  const height = vi.spyOn(terrain, "walkH")
  for (let frame = 0; frame < 600; frame++) updateMonsters([monster], root, frame * 16)
  expect(monster.body.visible).toBe(false)
  expect(motion).not.toHaveBeenCalled()
  expect(height).not.toHaveBeenCalled()
  // Passing the recovery time alone cannot override the authoritative zero HP.
  updateMonsters([monster], root, 100000)
  expect(motion).not.toHaveBeenCalled()
  monster.hp = MONSTER_KINDS[monster.spawn.kind].hp
  const now = 100001
  const expected = new MonsterMotion(monster.spawn, () => true).at(now)
  updateMonsters([monster], root, now)
  expect(monster.body.visible).toBe(true)
  expect(monster.pos).toEqual([expected.x, expected.z])
  expect(motion).toHaveBeenCalledWith(now)
  expect(height).toHaveBeenCalledTimes(1)
})
