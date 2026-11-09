import { expect, it } from "vitest"
import { keepersOnDuty } from "#/world/maps/keepers-on-duty"
import { npcCell } from "#/world/maps/npc-cell"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"

const at = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3))
const names = (map: string, shop: Parameters<typeof keepersOnDuty>[1], clock: string) => keepersOnDuty({ id: map }, shop, at(clock)).map((keeper) => keeper.name)

it("leaves out the baker firing the second oven on the square", () => {
  const counter = RESIDENT_WORK_SPOTS.get("マルタ")?.map ?? ""
  expect(npcCell({ id: "phanthiet" }, "マルタ", at("09:00"))).not.toBeNull()
  expect(names("phanthiet", "bakery", "09:00")).toEqual(["ハンス"])
  expect(names(counter, "bakery", "09:00")).toEqual([])
  expect(names(counter, "bakery", "10:00")).toEqual(["マルタ"])
})

it("leaves out the tailor buying flowers at the market well", () => {
  expect(npcCell({ id: "phanthiet-market" }, "マグダレーナ", at("19:45"))).not.toBeNull()
  expect(names("phanthiet-market", "tailor", "19:45")).toEqual([])
})

it("gives each keeper at the counter with the cell they stand on", () => {
  const keepers = keepersOnDuty({ id: "phanthiet" }, "bakery", at("09:00"))
  expect(keepers).toEqual([{ name: "ハンス", cell: npcCell({ id: "phanthiet" }, "ハンス", at("09:00")) }])
})
