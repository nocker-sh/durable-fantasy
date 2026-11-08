import { fireLights, houseGlows, houseShutters } from "#/world/scene/construction/registry"
import type { HOUSES } from "#/world/town/houses"
import { roomInUse } from "#/world/town/room-in-use"
import { windowsLit } from "#/world/town/windows-lit"
import { shuttersShut } from "#/world/town/shutters-shut"
import type { PointLight } from "three"

type Props = Readonly<{ houses: Readonly<typeof HOUSES> }>

/** 部屋の使用と家の生活時間を照明へ投影し、同じ階と家の判定を更新内で共有する。 */
export class SceneHouseLights {
  private readonly houses
  private readonly activeRooms = new Set<PointLight>()

  constructor(private readonly props: Props) {
    this.houses = new Map(this.props.houses.map((house) => [house.id, house]))
    Object.freeze(this)
  }

  readonly isActive = (light: PointLight): boolean => this.activeRooms.has(light)

  readonly update = (minute: number, daylight: number): void => {
    this.updateRooms(minute)
    this.updateWindows(minute, daylight)
    this.updateShutters(minute)
  }

  private updateRooms(minute: number): void {
    this.activeRooms.clear()
    const usedRooms = new Map<string, boolean>()
    for (const fixture of fireLights) {
      if (!fixture.room) continue
      const room = fixture.room
      const key = `${room.house}/${room.floor}`
      const house = this.houses.get(room.house)
      if (!usedRooms.has(key)) usedRooms.set(key, !!house && roomInUse(house, room.floor, minute))
      const isActive = usedRooms.get(key) === true
      if (isActive) this.activeRooms.add(fixture.light)
      if (fixture.glow) fixture.glow.emissiveIntensity = isActive ? 1.2 : 0
    }
  }

  private updateWindows(minute: number, daylight: number): void {
    for (const glow of houseGlows) {
      const house = this.houses.get(glow.house)
      glow.mat.emissiveIntensity = house && windowsLit(house, minute, glow.floor) ? 0.9 + (1 - daylight) * 0.7 : 0
    }
  }

  private updateShutters(minute: number): void {
    const shut = new Map<string, boolean>()
    for (const shutter of houseShutters) {
      if (!shut.has(shutter.house)) {
        const house = this.houses.get(shutter.house)
        shut.set(shutter.house, !!house && shuttersShut(house, minute))
      }
      shutter.mat.map = shut.get(shutter.house) ? shutter.shut : shutter.open
    }
  }
}
