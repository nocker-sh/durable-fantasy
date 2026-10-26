import { describe, expect, it } from "vitest"
import { SHOPS } from "../core/shops.ts"
import { MAPS, shopOpen } from "./index.ts"
import { INTERIORS, outsideDoor } from "../town/interiors.ts"
import { shopMarkers } from "./shop-markers.ts"

describe("shop minimap markers", () => {
  it("keeps every shop on its district map even when closed", () => {
    for (const [id, shop] of Object.entries(SHOPS)) {
      for (const min of [0, 360, 720, 1080]) {
        const marker = shopMarkers(shop.map, min)
          .flatMap((m) => m.shops)
          .find((s) => s.id === id)
        expect(marker, `${id} at ${min}`).toBeDefined()
        expect(marker!.open).toBe(shopOpen(marker!.id, min))
      }
    }
  })
  it("shows indoor counters at their street entrance too", () => {
    for (const interior of INTERIORS) {
      const inside = shopMarkers(interior.id, 720)
      for (const marker of inside) {
        const outside = shopMarkers(interior.house.map, 720).find((m) => m.shops.some((s) => s.id === marker.shops[0].id))
        expect(outside?.cell).toEqual(outsideDoor(interior.house).door)
      }
    }
  })
  it("combines shared pitches and preserves each seller's opening state", () => {
    const day = shopMarkers("phanthiet-market", 720)
    const night = shopMarkers("phanthiet-market", 1320)
    expect(day.some((m) => m.shops.length > 1)).toBe(true)
    expect(day.map((m) => m.cell)).toEqual(night.map((m) => m.cell))
    expect(day).not.toEqual(night)
    for (const map of Object.keys(MAPS)) {
      const markers = shopMarkers(map, 720)
      expect(new Set(markers.map((m) => m.cell.join(","))).size).toBe(markers.length)
    }
    expect(shopMarkers("deep-forest", 720)).toEqual([])
  })
})
