import { expect, it } from "vitest"
import { minimapTarget } from "#/world/client/minimap-target"
import { MAPS } from "#/world/maps/index"
import { shopMarkers } from "#/world/maps/shop-markers"
it("keeps the fruit stall marker instead of entering the nearby bakery", () => {
  const marker = shopMarkers("phanthiet", 720).find((m) => m.shops.some((s) => s.id === "fruit"))!
  const x = (marker.cell[0] + 0.5) / 2,
    z = (marker.cell[1] + 0.5) / 2
  const nearbyDoor = [{ at: [marker.cell[0] + 1, marker.cell[1]] satisfies [number, number] }]
  expect(minimapTarget({ x: x, z: z, warps: nearbyDoor, inputProps: { snapToWarp: false } })).toEqual({ x, z })
  expect(minimapTarget({ x: x, z: z, warps: nearbyDoor })).toEqual({ x: x + 0.5, z })
})
it("keeps every explicit shop marker at its own coordinates", () => {
  for (const entry1 of Object.entries(MAPS)) {
    const id = entry1[0],
      map = entry1[1]
    for (const marker of shopMarkers(id, 720)) {
      const x = (marker.cell[0] + 0.5) / 2,
        z = (marker.cell[1] + 0.5) / 2
      expect(minimapTarget({ x: x, z: z, warps: map.warps, inputProps: { snapToWarp: false } })).toEqual({ x, z })
    }
  }
})
it("selects the closest doorway rather than whichever is defined first", () => {
  const warps = [{ at: [4, 4] as const }, { at: [8, 4] as const }]
  expect(minimapTarget({ x: 4.25, z: 2.25, warps: warps })).toEqual({ x: 4.25, z: 2.25 })
  expect(minimapTarget({ x: 4.25, z: 2.25, warps: [...warps].reverse() })).toEqual({ x: 4.25, z: 2.25 })
})
it("leaves a click away from doorways unchanged", () => {
  expect(minimapTarget({ x: 20, z: 30, warps: [{ at: [4, 4] }] })).toEqual({ x: 20, z: 30 })
})
