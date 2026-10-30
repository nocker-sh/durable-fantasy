import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { roomCarryObstacles } from "#/scripts/lib/room-carry-obstacles"
import { certifyStorageCarry } from "../../world/town/storage-carry"
const fixture = () => readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h-m5-1.md", import.meta.url), "utf8"))
it("rejects crossing the fully open door even where the grid shows empty floor", () => {
  const room = fixture(),
    poses = [
      { body_m: [3.25, 9] as const, turn: 0 as const },
      { body_m: [3.75, 9] as const, turn: 0 as const },
    ]
  const check = () => certifyStorageCarry({ relative: [-0.04, 0.15, 0.04, 0.25], radius: 0.08, poses: poses, width: 6.5, depth: 10, obstacles: roomCarryObstacles(room) })
  expect(() => check()).toThrow("Carry body crosses a wall, door or furniture")
  room.door_leaves = []
  expect(check().segments).toBe(1)
})
it("refuses an invalid door instead of certifying a route after silently dropping its panel", () => {
  const room = fixture()
  const leaves = room.door_leaves as { door: number[] }[]
  leaves[0].door = [3, 3]
  expect(() =>
    certifyStorageCarry({
      relative: [0.5, -0.1, 0.7, 0.1],
      radius: 0.2,
      poses: [
        { body_m: [2, 2], turn: 0 },
        { body_m: [2, 3], turn: 0 },
      ],
      width: 10,
      depth: 10,
      obstacles: roomCarryObstacles(room),
    }),
  ).toThrow("Room has an invalid door leaf")
})
