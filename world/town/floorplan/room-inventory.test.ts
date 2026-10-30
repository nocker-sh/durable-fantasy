import { expect, it } from "vitest"
import { unrepresentedRooms } from "#/world/town/floorplan/room-inventory"
it("does not mistake a shared room for a separately declared smoking room", () => {
  expect(
    unrepresentedRooms(
      [
        { floor: 0, name: "居間" },
        { floor: 0, name: "燻し部屋" },
      ],
      [{ floor: 0, name: "居間" }],
    ),
  ).toEqual([{ floor: 0, name: "燻し部屋" }])
})
it("matches the declared floor and keeps repeated rooms distinct", () => {
  const room = { floor: 0, name: "物置" }
  expect(unrepresentedRooms([room, room], [room])).toEqual([room])
  expect(unrepresentedRooms([room], [{ ...room, floor: 1 }])).toEqual([room])
})
it("permits generated halls and a reordered inventory without changing the source", () => {
  const source = [
      { floor: 0, name: "台所" },
      { floor: 1, name: "寝室" },
    ],
    before = JSON.stringify(source)
  expect(unrepresentedRooms(source, [...source].reverse().concat({ floor: 1, name: "廊下" }))).toEqual([])
  expect(JSON.stringify(source)).toBe(before)
})
