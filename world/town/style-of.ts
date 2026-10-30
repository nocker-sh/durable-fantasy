import { HOUSEHOLDS } from "#/world/town/houses"
import { floorsOf } from "#/world/town/floors-of"
import type { HouseDef } from "#/world/town/house-types"
import type { RoofShape, WindowKind, DoorKind, HouseStyle } from "#/world/town/style"
import { pickHouseStyle } from "#/world/town/pick-house-style"
import { wallsFor } from "#/world/town/walls-for"

/** The look a household's life allows; `turn` tries the next of the allowed choices. */
export function styleOf(h: HouseDef, turn: number): HouseStyle {
  const hh = HOUSEHOLDS.find((x) => x.id === h.household)
  const living = hh?.living
  const floors = floorsOf(h)
  const s = h.seed + turn * 101
  const wall = pickHouseStyle(wallsFor(h), s, 1)
  const roofRamp =
    h.roof === "thatch"
      ? "thatch"
      : h.roof === "slate"
        ? pickHouseStyle(["slate", "slate2"] as const, s, 2)
        : pickHouseStyle(h.roof === "roof" ? (["roof", "roof3"] as const) : (["roof2", "roof3"] as const), s, 3)
  const small = (h.x1 - h.x0) * (h.z1 - h.z0) < 13
  const roofShape: RoofShape =
    h.kind === "farm" && small
      ? "shed"
      : h.roof === "thatch"
        ? pickHouseStyle(["hip", "gable"] as const, s, 4)
        : small && floors === 1
          ? pickHouseStyle(["shed", "gable"] as const, s, 5)
          : pickHouseStyle(["gable", "gable", "hip"] as const, s, 6)
  const windows: WindowKind =
    living === "ゆとりがある" || h.kind === "public"
      ? pickHouseStyle(["leaded", "square"] as const, s, 7)
      : living === "慎ましい" || h.kind === "farm"
        ? pickHouseStyle(["small", "square"] as const, s, 9)
        : pickHouseStyle(["square", "leaded", "small"] as const, s, 7)
  const shutter = pickHouseStyle(["cGreen", "cBlue", "cRed", "wood", "cMustard", "cSky", "cWine"], s, 8)
  const door: DoorKind = h.kind === "public" ? "double" : h.kind === "shop" ? "arched" : "plank"
  const workFire = /鍛冶|パン|宿|酒|醸造|調合|薬/.test((hh?.trade ?? "") + (h.plan.workshop ?? "") + h.name)
  const chimneys: 0 | 1 | 2 = !h.plan.hearth ? 0 : h.kind !== "vacant" && workFire && floors > 1 ? 2 : 1
  const jetty = wall === "timber" && floors > 1
  return { roofShape, wall, roofRamp, windows, shutter, door, chimneys, jetty }
}
