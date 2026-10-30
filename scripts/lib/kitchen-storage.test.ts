import { shelfFrameSchema } from "#/scripts/lib/shelf-frame-schema"
import { auditClothDrying } from "#/scripts/lib/audit-cloth-drying"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { auditFurnitureUse } from "#/scripts/lib/furniture-use"
import { auditStorageRetrieval } from "#/scripts/lib/audit-storage-retrieval"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { storageBoxInterior } from "#/world/town/storage-box-interior"

const readKitchen = () => readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-2.md", import.meta.url), "utf8"))
const building = readSetting(readFileSync(new URL("../../.docs/settings/buildings/building-h1.md", import.meta.url), "utf8"))

it("fits the shallow west-facing storage, full-size operator and withdrawals in the actual kitchen", () => {
  const room = readKitchen()
  const cabinet = room.furniture?.find((furniture) => furniture.symbol === "C")
  if (!cabinet) throw new Error("Missing designed kitchen shelf")
  const shelf = shelfDimensions(cabinet.shelf, cabinet.rect[2] * 0.5, cabinet.rect[3] * 0.5)

  expect(auditRoomGrid(room)).toEqual([])
  expect(auditFurnitureUse(room)).toEqual([])
  expect(auditStorageRetrieval(room, building)).toEqual([])
  expect(shelf.front).toBe("w")
  const originalItems = shelf.items?.filter((item) => ["C-clean-box-1", "C-clean-box-2", "C-clean-cloth"].includes(item.id))
  expect(originalItems).toHaveLength(3)
  expect(shelf.items?.map((item) => item.id)).toEqual(["C-clean-box-1", "C-clean-box-2", "C-clean-cloth", "C-tea-box", "C-pot-box"])
  const interiors: Readonly<Record<string, readonly [number, number, number]>> = {
    "C-clean-box-1": [0.29, 0.27, 0.21],
    "C-clean-box-2": [0.29, 0.27, 0.21],
    "C-tea-box": [0.27, 0.27, 0.13],
    "C-pot-box": [0.29, 0.29, 0.31],
  }
  for (const box of shelf.items?.filter((item) => item.kind === "box") ?? []) {
    const interior = storageBoxInterior(box)
    expect(interior.volume).toBeLessThan(box.width * box.depth * box.height)
    const expected = interiors[box.id]
    if (!expected) throw new Error("Unspecified kitchen box interior")
    expect(interior.width).toBeCloseTo(expected[0])
    expect(interior.depth).toBeCloseTo(expected[1])
    expect(interior.height).toBeCloseTo(expected[2])
  }
})

it("rejects washing and shelf use at the same time instead of counting overlapping space twice", () => {
  const room = readKitchen()
  room.parallel_use = [
    {
      activity: "洗い物と棚の出し入れ",
      operations: [
        { resident: "ヴィルヘルム", furniture: "B", space_index: 0 },
        { resident: "ゾフィー", furniture: "C", space_index: 0 },
      ],
    },
  ]

  expect(auditFurnitureUse(room)).toContain("洗い物と棚の出し入れ: simultaneous operating spaces overlap")
})

it("rejects moving the wash bucket into the operator's retreat", () => {
  const room = readKitchen()
  const bucket = room.furniture?.find((furniture) => furniture.symbol === "B")
  if (!bucket) throw new Error("Missing wash bucket")
  bucket.rect = [3, 10, 1, 1]

  expect(auditStorageRetrieval(room, building)).toContain("C/C-clean-box-1: retrieval body crosses a wall or furniture")
})

it("contains both drying cloths above the tray and stores all four folded layers", () => {
  const room = readKitchen()
  expect(auditClothDrying(room)).toEqual([])

  const cabinet = room.furniture?.find((furniture) => furniture.symbol === "C")
  if (!cabinet || !cabinet.shelf || typeof cabinet.shelf !== "object") throw new Error("Missing kitchen storage")
  const shelf = shelfDimensions(cabinet.shelf, 0.5, 1)
  const cloth = shelf.items?.find((item) => item.id === "C-clean-cloth")
  expect(cloth?.height).toBe(0.016)
})

it("does not count one folded cloth as storage for two drying cloths", () => {
  const room = readKitchen()
  const cabinet = room.furniture?.find((furniture) => furniture.symbol === "C")
  if (!cabinet) throw new Error("Missing kitchen storage")
  const parsed = shelfFrameSchema.safeParse(cabinet.shelf)
  if (!parsed.success) throw new Error("Invalid kitchen shelf")
  const cloth = parsed.data.contents?.find((item) => item !== null && typeof item === "object" && "id" in item && item.id === "C-clean-cloth")
  if (!cloth || typeof cloth !== "object" || !("height_m" in cloth)) throw new Error("Missing stored cloth")
  cloth.height_m = 0.008

  expect(auditClothDrying(room)).toContain("room-h1-2/V: Stored linen cannot contain every folded drying cloth")
})

it("does not silently discard a drying design attached to unrelated furniture", () => {
  const room = readKitchen()
  const rack = room.furniture?.find((furniture) => furniture.symbol === "V")
  if (!rack) throw new Error("Missing drying rack")
  rack.role = "storage"

  expect(auditClothDrying(room)).toContain("room-h1-2: Cloth drying dimensions need an occupied drying rack")
})
