import { expect, it } from "vitest"
import { useOf } from "#/world/town/floorplan/use-of"

it("uses a room's explicit purpose before treating an unspecific private room as a bedroom", () => {
  expect(useOf("灰の袋置き場")).toBe("貯蔵")
  expect(useOf("燻し部屋")).toBe("作業場")
  expect(useOf("乾燥部屋")).toBe("貯蔵")
  expect(useOf("薬草の乾燥部屋")).toBe("貯蔵")
  expect(useOf("作業場の部屋")).toBe("作業場")
  expect(useOf("農具の部屋")).toBe("貯蔵")
  expect(useOf("エーファの部屋")).toBe("寝間")
  expect(useOf("エーファの寝間")).toBe("寝間")
})
