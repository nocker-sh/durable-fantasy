import { expect, it } from "vitest"
import { getFurnitureKind } from "#/world/town/get-furniture-kind"
import { parseFurnitureKind } from "#/world/town/parse-furniture-kind"
import { FURNITURE_KINDS } from "#/world/town/furniture-kinds"

it("preserves specific name precedence before broad shelf, chair and bed matches", () => {
  expect(getFurnitureKind("鍵付きの陳列棚")).toBe("counter")
  expect(getFurnitureKind("本棚（2階）")).toBe("shelf")
  expect(getFurnitureKind("長椅子")).toBe("bench")
  expect(getFurnitureKind("暖炉の前の揺り椅子")).toBe("chair")
  expect(getFurnitureKind("子どもの寝台")).toBe("bed")
  expect(getFurnitureKind("糸車")).toBe("spinning-wheel")
  expect(getFurnitureKind("機織り機")).toBe("loom")
})

it("keeps unknown names unsupported and rejects unknown explicit renderer identities", () => {
  expect(getFurnitureKind("未登録の作業具")).toBeNull()
  expect(getFurnitureKind("ろくろの予備部品")).toBeNull()
  for (const kind of FURNITURE_KINDS) expect(parseFurnitureKind(kind)).toBe(kind)
  for (const kind of ["", "unknown", "shelf-extra", "Shelf"]) expect(() => parseFurnitureKind(kind)).toThrow(`Unknown furniture kind: ${kind}`)
})
