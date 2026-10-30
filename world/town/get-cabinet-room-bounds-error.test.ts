import { expect, it } from "vitest"
import { getCabinetRoomBoundsError } from "#/world/town/get-cabinet-room-bounds-error"
const section = { bounds: { x0: 0, x1: 3, z0: 0, z1: 4 }, ceiling: 2 },
  part = { x0: 0, x1: 3, z0: 0, z1: 4, bottom: 0, top: 2 }

it("retains boundary contact while rejecting a part outside any room face", () => {
  expect(getCabinetRoomBoundsError({ parts: [part], section })).toBeNull()
  for (const outside of [
    { ...part, x0: -0.001 },
    { ...part, x1: 3.001 },
    { ...part, z0: -0.001 },
    { ...part, z1: 4.001 },
    { ...part, bottom: -0.001 },
    { ...part, top: 2.001 },
  ])
    expect(getCabinetRoomBoundsError({ parts: [outside], section })).toBeInstanceOf(Error)
})

it("refuses absent, reversed and nonfinite geometry instead of passing vacuous or unordered comparisons", () => {
  expect(getCabinetRoomBoundsError({ parts: [], section })).toBeInstanceOf(Error)
  for (const invalid of [
    { ...part, x0: NaN },
    { ...part, top: Infinity },
    { ...part, bottom: -Infinity },
    { ...part, z1: 0 },
  ])
    expect(getCabinetRoomBoundsError({ parts: [invalid], section })).toBeInstanceOf(Error)
  expect(getCabinetRoomBoundsError({ parts: [part], section: { ...section, ceiling: NaN } })).toBeInstanceOf(Error)
})
