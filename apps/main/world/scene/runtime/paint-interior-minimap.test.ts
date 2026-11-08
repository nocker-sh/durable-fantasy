import { expect, it } from "vitest"
import { paintInteriorMinimap } from "#/world/scene/runtime/paint-interior-minimap"
import type { Furniture } from "#/world/town/interiors"

it("paints the background, floor and solid furniture in order using centered furniture bounds", () => {
  const paints: { color: string; rect: number[] }[] = []
  const context = {
    fillStyle: "",
    fillRect(x: number, y: number, width: number, height: number) {
      paints.push({ color: this.fillStyle, rect: [x, y, width, height] })
    },
  }
  const furniture: Furniture[] = [
    { kind: "table", x: 15, z: 16, w: 4, d: 2, solid: true },
    { kind: "table", x: 10, z: 14, w: 2, d: 2, solid: false },
  ]
  paintInteriorMinimap(context, { w: 96, h: 48 }, { x0: 10, x1: 20, z0: 12, z1: 18, furniture })
  expect(paints).toEqual([
    { color: "#0c0a10", rect: [0, 0, 96, 48] },
    { color: "#6a4a32", rect: [20, 24, 20, 12] },
    { color: "#3a2618", rect: [26, 30, 8, 4] },
  ])
})
