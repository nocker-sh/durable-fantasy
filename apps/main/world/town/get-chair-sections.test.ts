import { expect, it } from "vitest"
import { getChairSections } from "#/world/town/get-chair-sections"
import { seatForward } from "#/world/town/seat-forward"
import type { SeatSpec } from "#/world/town/room-fixtures"
const seat: SeatSpec = { width: 0.46, depth: 0.44, height: 0.358, backHeight: 0.88, boardThickness: 0.04, legWidth: 0.04 }
it("keeps four legs, a supported seat and a back opposite each authored facing", () => {
  for (const facing of ["n", "s", "e", "w"] satisfies NonNullable<SeatSpec["facing"]>[]) {
    const sections = getChairSections({ seat: { ...seat, facing }, at: [1, 2], floor: 0.02, legInset: 0, backThickness: seat.legWidth, hasBack: true })
    expect(sections.filter((section) => section.part === "leg")).toHaveLength(4)
    const board = sections.find((section) => section.part === "seat"),
      back = sections.find((section) => section.part === "back")
    if (!board || !back) throw new Error("Missing chair board or back")
    expect(board.y1).toBeCloseTo(0.02 + seat.height)
    for (const leg of sections.filter((section) => section.part === "leg")) expect(leg.y1).toBe(board.y0)
    const forward = seatForward(facing)
    expect(((back.x0 + back.x1) / 2 - 1) * forward[0] + ((back.z0 + back.z1) / 2 - 2) * forward[1]).toBeCloseTo(-seat.depth / 2 + seat.legWidth / 2)
  }
})
it("preserves foot-rest boards and bearers independently of an omitted back", () => {
  const sections = getChairSections({
    seat: { ...seat, footRest: { height: 0.1, width: 0.4, depth: 0.12, forward: 0.25, thickness: 0.03 } },
    at: [0, 0],
    floor: 0,
    legInset: 0.02,
    backThickness: 0.05,
    hasBack: false,
  })
  expect(sections.filter((section) => section.part === "back")).toHaveLength(0)
  expect(sections.filter((section) => section.part === "board")).toHaveLength(1)
  expect(sections.filter((section) => section.part === "bearer")).toHaveLength(2)
  expect(seat).not.toHaveProperty("footRest")
})
