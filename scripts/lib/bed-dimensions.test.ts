import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { bedDimensions } from "#/scripts/lib/bed-dimensions"
import { bedDimensionsSchema } from "#/scripts/lib/bed-dimensions-schema"
import { bedParts } from "#/world/town/bed-parts"
it("reads each monk's owned bed from the room document and rejects missing or impossible dimensions", () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h10-2.md", import.meta.url), "utf8"))
  expect(auditRoomGrid(room)).toEqual([])
  const beds = room.furniture!.filter((f) => f.runtime_kind === "bed")
  expect(beds).toHaveLength(2)
  for (const piece of beds) {
    const spec = bedDimensions(piece.bed, piece.rect[2] * room.grid!.cell_m, piece.rect[3] * room.grid!.cell_m)
    expect(spec.linen).toBeNull()
    expect(bedParts({ at: [0, 0], size: [1, 2], floor: 0, bed: spec }).find((p) => p.kind === "mattress")!.y1).toBeCloseTo(0.5)
    const bad = structuredClone(room)
    bad.furniture!.find((f) => f.symbol === piece.symbol)!.bed = { ...(piece.bed as object), deck_thickness_m: 1 }
    expect(auditRoomGrid(bad)).toContain(`${piece.symbol}: Invalid bed dimensions`)
  }
  expect(() => bedDimensions(undefined, 1, 2)).toThrow("Missing bed")
  expect(() => bedDimensions({ frame_height_m: "0.38" }, 1, 2)).toThrow("Invalid bed")
})

it("rejects malformed measured linen instead of silently drawing a bare mattress", () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-3.md", import.meta.url), "utf8")),
    piece = room.furniture?.find((candidate) => candidate.symbol === "B")
  if (!piece) throw new Error("Missing source bed")
  const measurements = bedDimensionsSchema.parse(piece.bed)
  if (!measurements.linen) throw new Error("Missing source linen")
  for (const linen of [[], [measurements.linen[0]], [{ ...measurements.linen[0], kind: "sheet" }, measurements.linen[1]], [{ ...measurements.linen[0], width_m: "0.5" }, measurements.linen[1]]])
    expect(() => bedDimensions({ ...measurements, linen }, 1, 2)).toThrow("Invalid bed dimensions")
})
