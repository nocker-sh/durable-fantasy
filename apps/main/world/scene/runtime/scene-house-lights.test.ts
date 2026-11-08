import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { MeshLambertMaterial, PointLight, Texture } from "three"
import { SceneHouseLights } from "#/world/scene/runtime/scene-house-lights"
import { fireLights, houseGlows, houseShutters } from "#/world/scene/construction/registry"
import { HOUSES } from "#/world/town/houses"
import { roomInUse } from "#/world/town/room-in-use"
import { windowsLit } from "#/world/town/windows-lit"
import { shuttersShut } from "#/world/town/shutters-shut"

vi.mock("#/world/town/room-in-use", () => ({ roomInUse: vi.fn() }))
vi.mock("#/world/town/windows-lit", () => ({ windowsLit: vi.fn() }))
vi.mock("#/world/town/shutters-shut", () => ({ shuttersShut: vi.fn() }))
beforeEach(() => vi.resetAllMocks())
afterEach(() => {
  for (const fixture of fireLights) fixture.glow?.dispose()
  for (const glow of houseGlows) glow.mat.dispose()
  for (const shutter of houseShutters) {
    shutter.mat.dispose()
    shutter.open.dispose()
    shutter.shut.dispose()
  }
  fireLights.length = houseGlows.length = houseShutters.length = 0
})

it("shares each floor's occupancy lookup, extinguishes unknown rooms, and clears previous active lights", () => {
  const house = HOUSES[0]
  const lighting = new SceneHouseLights({ houses: HOUSES })
  for (const room of [
    { house: house.id, floor: 1 },
    { house: house.id, floor: 1 },
    { house: house.id, floor: 2 },
    { house: "missing", floor: 1 },
  ]) {
    fireLights.push({ room, light: new PointLight(), base: 1, seed: 0, glow: new MeshLambertMaterial() })
  }
  vi.mocked(roomInUse).mockImplementation((_house, floor, minute) => floor === 1 && minute === 1290)
  lighting.update(1290, 0)
  expect(roomInUse).toHaveBeenCalledTimes(2)
  expect(fireLights.map((fixture) => lighting.isActive(fixture.light))).toEqual([true, true, false, false])
  expect(fireLights.map((fixture) => fixture.glow?.emissiveIntensity)).toEqual([1.2, 1.2, 0, 0])
  lighting.update(720, 1)
  expect(roomInUse).toHaveBeenCalledTimes(4)
  expect(fireLights.every((fixture) => !lighting.isActive(fixture.light))).toBe(true)
  expect(Object.isFrozen(lighting)).toBe(true)
})

it("keeps window usage floor-specific and dims missing houses", () => {
  const house = HOUSES[0]
  houseGlows.push({ house: house.id, floor: 1, mat: new MeshLambertMaterial() }, { house: house.id, floor: 2, mat: new MeshLambertMaterial() }, { house: "missing", mat: new MeshLambertMaterial() })
  vi.mocked(windowsLit).mockImplementation((_house, _minute, floor) => floor === 1)
  new SceneHouseLights({ houses: HOUSES }).update(1290, 0)
  expect(windowsLit).toHaveBeenCalledWith(house, 1290, 1)
  expect(windowsLit).toHaveBeenCalledWith(house, 1290, 2)
  expect(houseGlows.map((glow) => glow.mat.emissiveIntensity)).toEqual([1.6, 0, 0])
})

it("shares each house's shutter rule within an update and reevaluates it at the next time", () => {
  const house = HOUSES[0]
  for (const name of [house.id, house.id, "missing"]) houseShutters.push({ house: name, mat: new MeshLambertMaterial(), open: new Texture(), shut: new Texture() })
  vi.mocked(shuttersShut).mockReturnValue(true)
  const lighting = new SceneHouseLights({ houses: HOUSES })
  lighting.update(720, 1)
  expect(shuttersShut).toHaveBeenCalledExactlyOnceWith(house, 720)
  expect(houseShutters.map((shutter) => shutter.mat.map === shutter.shut)).toEqual([true, true, false])
  vi.mocked(shuttersShut).mockReturnValue(false)
  lighting.update(1290, 0)
  expect(shuttersShut).toHaveBeenCalledTimes(2)
  expect(houseShutters.every((shutter) => shutter.mat.map === shutter.open)).toBe(true)
})
