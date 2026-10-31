import { afterEach, expect, it, vi } from "vitest"
import { walkH } from "#/world/scene/walk-h"
import * as groundModule from "#/world/scene/ground-h"
import { layout } from "#/world/scene/world"
import { setWalkSurfaces } from "#/world/scene/set-walk-surfaces"

const previous = layout.value
afterEach(() => {
  vi.restoreAllMocks()
  layout.value = previous
  setWalkSurfaces([])
})

it("uses a raised walk surface even when it overlaps a bridge deck", () => {
  vi.spyOn(groundModule, "groundH").mockReturnValue(0)
  layout.value = { ...previous, bridge: { x0: 0, z0: 0, x1: 4, z1: 4 } }
  setWalkSurfaces([{ rect: [0, 0, 4, 4], height: 3 }])
  expect(walkH(2, 2)).toBe(3)
})
