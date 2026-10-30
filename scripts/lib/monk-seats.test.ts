import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { seatDimensions } from "./seat-dimensions"
import { footRestSections } from "../../world/town/foot-rest"
const read = () => readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h10-1.md", import.meta.url), "utf8"))
it("keeps each monk's seat facing its assigned work surface with knee clearance", () => {
  const room = read()
  expect(auditRoomGrid(room)).toEqual([])
  for (const symbol of ["A", "E", "C"]) {
    const copy = structuredClone(room),
      chair = copy.furniture!.find((f) => f.symbol === symbol)!
    chair.seat!.facing = symbol === "A" ? "n" : symbol === "E" ? "e" : "s"
    const table = symbol === "C" ? "R" : "T"
    expect(auditRoomGrid(copy)).toContain(`${table}: seat ${symbol} faces away from its work surface`)
  }
  const copy = read()
  copy.furniture!.find((f) => f.symbol === "T")!.work_surface!.height_m = 0.55
  expect(auditRoomGrid(copy)).toContain("T: insufficient knee clearance above A")
})
it("rotates rectangular chair dimensions and foot supports without swapping their physical lengths", () => {
  const raw = { width_m: 0.4, depth_m: 0.6, height_m: 0.44, back_height_m: 0.88, board_thickness_m: 0.04, leg_width_m: 0.04, facing: "e" }
  expect(seatDimensions(raw, 0.6, 0.4).depth).toBe(0.6)
  expect(() => seatDimensions({ ...raw, facing: "n" }, 0.6, 0.4)).toThrow("Invalid chair dimensions")
  expect(() => seatDimensions({ ...raw, facing: ["n"] }, 0.6, 0.4)).toThrow("Invalid chair facing")
  for (const facing of ["n", "s", "w", "e"] as const) {
    const seat = seatDimensions({ ...raw, facing }, 0.8, 0.8)
    seat.footRest = { height: 0.15, width: 0.4, depth: 0.3, forward: 0.4, thickness: 0.025 }
    const board = footRestSections({ seat: seat, x: 0, z: 0 })[0],
      x = (board.x0 + board.x1) / 2,
      z = (board.z0 + board.z1) / 2
    expect([x, z]).toEqual(facing === "n" ? [0, -0.4] : facing === "s" ? [0, 0.4] : facing === "w" ? [-0.4, 0] : [0.4, 0])
  }
})
