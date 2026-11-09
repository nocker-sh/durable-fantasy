import { expect, it } from "vitest"
import { getCommandShopAccess } from "#/world/server/map-room/get-command-shop-access"
import { timeFor } from "#/world/server/map-room/time-for"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { npcCell } from "#/world/maps/npc-cell"
import { TALK_CELLS } from "#/world/maps"
import { cellDistance } from "#/world/maps/cell-distance"
import { player } from "#/world/test/player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Cell } from "#/world/maps/types"

// the authored routines at a held dev clock: no stubs between the schedule and the access check
const at = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3))
const standing = (cell: Cell, clock: string): Presence => ({
  owner: "owner",
  player: mapPlayer("connection", player(), [cell[0], cell[1]]),
  route: [[cell[0], cell[1]]],
  since: 0,
  said: [],
  engaged: null,
  held: at(clock),
})
const cellOf = (map: string, name: string, clock: string): Cell => {
  const cell = npcCell({ id: map }, name, at(clock))
  if (!cell) throw Error(`${name} is not on ${map} at ${clock}`)
  return cell
}

it("credits only the baker at the counter while the other fires the oven on the square", () => {
  const hans = cellOf("phanthiet", "ハンス", "09:00")
  const marta = cellOf("phanthiet", "マルタ", "09:00")
  // within talking reach of the oven, on the side away from the counter
  const reach = TALK_CELLS + 1
  const oven: Cell = [marta[0] + Math.sign(marta[0] - hans[0]) * reach, marta[1] + Math.sign(marta[1] - hans[1]) * reach]
  expect(cellDistance(oven, marta)).toBeLessThanOrEqual(reach)
  expect(cellDistance(oven, hans)).toBeGreaterThan(reach)
  const command = { type: "buy", shop: "bakery", item: "rye-bread", count: 1 } as const
  expect(timeFor(standing(hans, "09:00"))).toBe(at("09:00"))
  expect(getCommandShopAccess({ map: { id: "phanthiet" }, me: standing(hans, "09:00") }, command)).toEqual({ ok: true, keepers: ["ハンス"] })
  expect(getCommandShopAccess({ map: { id: "phanthiet" }, me: standing(oven, "09:00") }, command)).toEqual({ ok: false, reason: "TOO_FAR" })
})

it("does not sell from the tailor's shelf beside her at the market well", () => {
  const well = cellOf("phanthiet-market", "マグダレーナ", "19:45")
  const command = { type: "buy", shop: "tailor", item: "wool-muffler", count: 1 } as const
  expect(getCommandShopAccess({ map: { id: "phanthiet-market" }, me: standing(well, "19:45") }, command)).toEqual({ ok: false, reason: "TOO_FAR" })
})
