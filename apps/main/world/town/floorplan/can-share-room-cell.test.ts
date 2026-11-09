import { expect, it } from "vitest"
import { canShareRoomCell } from "#/world/town/floorplan/can-share-room-cell"

it("shares only matching boundary walls and doors, symmetrically", () => {
  for (const firstTile of ["#", "D", ".", "B", "", " "]) {
    for (const secondTile of ["#", "D", ".", "B", "", " "]) {
      for (const firstBoundary of [false, true]) {
        for (const secondBoundary of [false, true]) {
          const first = Object.freeze({ tile: firstTile, boundary: firstBoundary })
          const second = Object.freeze({ tile: secondTile, boundary: secondBoundary })
          const expected = firstBoundary && secondBoundary && ((firstTile === "#" && secondTile === "#") || (firstTile === "D" && secondTile === "D"))
          expect(canShareRoomCell(first, second)).toBe(expected)
          expect(canShareRoomCell(second, first)).toBe(expected)
        }
      }
    }
  }
})
