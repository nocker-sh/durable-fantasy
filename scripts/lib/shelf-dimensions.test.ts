import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
const read = (id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/rooms/${id}.md`, import.meta.url), "utf8"))
it("reads every authored shelf and requires named owned sources for stored documents", () => {
  for (const id of ["room-h10-1", "room-h-m5-2"]) {
    const room = read(id),
      k = room.grid!.cell_m
    expect(auditRoomGrid(room)).toEqual([])
    for (const f of room.furniture!.filter((f) => f.runtime_kind === "shelf")) {
      const shelf = shelfDimensions(f.shelf, f.rect[2] * k, f.rect[3] * k)
      expect(shelf.levels.length).toBeGreaterThanOrEqual(2)
      if (id === "room-h-m5-2") expect(shelf.items!.length).toBeGreaterThan(0)
    }
  }
  const room = read("room-h-m5-2"),
    f = room.furniture!.find((f) => f.runtime_kind === "shelf")!
  const invalid = structuredClone(f.shelf) as { contents: { owner?: string }[] }
  delete invalid.contents[0].owner
  expect(() => shelfDimensions(invalid, 2, 0.5)).toThrow("Invalid shelf contents")
  f.shelf = { height_m: 1, board_thickness_m: 0.5, board_tops_m: [0.5, 1], front: "s" }
  expect(auditRoomGrid(room)).toContain(`${f.symbol}: Invalid shelf dimensions`)
})

it("rejects measured storage that would be silently drawn as a different kind", () => {
  const room = read("room-h-m5-2"),
    f = room.furniture!.find((f) => f.runtime_kind === "shelf")!
  f.runtime_kind = "crate"
  expect(auditRoomGrid(room)).toContain(`${f.symbol}: shelf needs shelf rendering`)
})

it("rejects malformed lid movement and box-only metadata on fabric", () => {
  const room = read("room-h10-2"),
    s = room.furniture!.find((f) => f.symbol === "C")!.shelf as { contents: Record<string, unknown>[] }
  s.contents[0].lid_lift_m = "0.1"
  expect(() => shelfDimensions(s, 1, 0.5)).toThrow("Invalid shelf contents")
  s.contents[0].lid_lift_m = -0.1
  expect(() => shelfDimensions(s, 1, 0.5)).toThrow("Invalid storage box lid lift")
  const linen = room.furniture!.find((f) => f.symbol === "F")!.shelf as { contents: Record<string, unknown>[] }
  linen.contents[0].lid_thickness_m = 0.02
  expect(() => shelfDimensions(linen, 2, 0.5)).toThrow("Invalid shelf contents")
})

it("rejects an unsupported box material rather than silently drawing wood", () => {
  const room = read("room-h-m5-1"),
    f = room.furniture!.find((f) => f.symbol === "R")!,
    raw = f.shelf as { contents: Record<string, unknown>[] }
  raw.contents[0].box_material = "paper"
  expect(() => shelfDimensions(raw, 0.5, 0.5)).toThrow("Invalid storage box material")
})
