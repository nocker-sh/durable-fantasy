import { expect, it } from "vitest"
import { getShelfItem } from "#/scripts/lib/get-shelf-item"

const cloth = { id: "cloth", name: "乾いた布", owner: "世帯", source: "家庭で洗い乾かす", kind: "linen", board: 0, across_m: 0, from_back_m: 0.04, width_m: 0.5, height_m: 0.1, depth_m: 0.3 }

it("keeps identity and input intact while mapping authored units", () => {
  const authored = { ...cloth, id: " cloth " }
  const before = structuredClone(authored)
  const item = getShelfItem(authored)
  if (item instanceof Error) throw item

  expect(item.id).toBe(authored.id)
  expect(item.width).toBe(0.5)
  expect(item.fromBack).toBe(0.04)
  expect(authored).toEqual(before)
})

it.each([
  null,
  [],
  { ...cloth, owner: "   " },
  { ...cloth, width_m: "0.5" },
  { ...cloth, width_m: Infinity },
  { ...cloth, kind: "pottery" },
  { ...cloth, tool: { handle_width_m: 0.03, blade_length_m: 0.1 } },
  { ...cloth, lid_thickness_m: 0.02 },
])("rejects malformed storage without coercing input: %j", (authored) => {
  expect(getShelfItem(authored)).toBeInstanceOf(Error)
})

it("rejects missing tool dimensions and malformed retrieval before geometry uses them", () => {
  expect(getShelfItem({ ...cloth, kind: "tool" })).toEqual(new Error("Invalid stored tool dimensions"))
  expect(getShelfItem({ ...cloth, retrieval: { withdraw_m: 0.4 } })).toEqual(new Error("Invalid shelf retrieval"))
})
