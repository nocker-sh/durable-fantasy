import { expect, it } from "vitest"
import { getInteriorPiece } from "#/world/town/get-interior-piece"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import { HOUSES } from "#/world/town/houses"
const placement = { x: 12, z: 18, w: 1.2, d: 0.6 }

it("honors explicit authored kinds, leaves unknown shapes complete and keeps traces nonblocking", () => {
  expect(getInteriorPiece({ piece: { name: "本棚", kind: "workbench", solid: true }, placement })).toEqual({ kind: "workbench", ...placement, name: "本棚", solid: true })
  expect(getInteriorPiece({ piece: { name: "未登録の作業具", solid: true }, placement })).toEqual({ ...placement, name: "未登録の作業具", solid: true })
  expect(getInteriorPiece({ piece: { name: "未登録の作業具", kind: "trace", solid: true }, placement })).toEqual({ kind: "trace", ...placement, name: "未登録の作業具", solid: false })
  expect(getInteriorPiece({ piece: { name: "本棚", kind: "shelf", solid: true, on: "床" }, placement })).toEqual({ kind: "trace", ...placement, name: "本棚", solid: false, on: "床" })
})

it("does not leak fitting and floor-plan fields or mutate the source into render records", () => {
  const piece = { name: "未登録の作業具", solid: true, floor: 1, wall: true, x0: 100, sourceOnly: "keep in plan" },
    before = JSON.stringify(piece)
  const projected = getInteriorPiece({ piece, placement })
  expect(projected).toEqual({ ...placement, name: piece.name, solid: true })
  expect(JSON.stringify(piece)).toBe(before)
})

it("preserves all supported geometric attachments and their ownership of dimensions across the current plans", () => {
  type GeometryKey = Exclude<keyof Parameters<typeof getInteriorPiece>[0]["piece"], "name" | "solid" | "on" | "kind">
  const keys: ReadonlyArray<GeometryKey> = ["cookingTop", "hearth", "hearthFront", "shelf", "bed", "workSurface", "seat", "wallMount"],
    visited = new Set<GeometryKey>()
  for (const house of HOUSES)
    for (const piece of floorPlan(house.id).pieces) {
      const before = JSON.stringify(piece),
        projected = getInteriorPiece({ piece, placement })
      for (const key of keys) {
        expect(projected[key]).toBe(piece[key])
        if (piece[key] !== undefined) visited.add(key)
      }
      expect(JSON.stringify(piece)).toBe(before)
    }
  expect(visited.size).toBeGreaterThan(0)
})
