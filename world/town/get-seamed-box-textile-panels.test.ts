import { expect, it } from "vitest"
import { getSeamedBoxTextilePanels } from "#/world/town/get-seamed-box-textile-panels"

it("retains all six filled faces and adds seam stock outside every edge", () => {
  const props = { size: [0.5, 0.08, 0.3], seamAllowance: 0.015 } satisfies Parameters<typeof getSeamedBoxTextilePanels>[0]
  const before = JSON.stringify(props),
    panels = getSeamedBoxTextilePanels(props)
  if (panels instanceof Error) throw panels
  expect(panels.map((panel) => panel.face)).toEqual(["top", "bottom", "north", "south", "west", "east"])
  for (const index of [0, 1]) {
    expect(panels[index].size[0]).toBeCloseTo(0.53, 14)
    expect(panels[index].size[1]).toBeCloseTo(0.33, 14)
  }
  for (const index of [2, 3]) {
    expect(panels[index].size[0]).toBeCloseTo(0.53, 14)
    expect(panels[index].size[1]).toBeCloseTo(0.11, 14)
  }
  for (const index of [4, 5]) {
    expect(panels[index].size[0]).toBeCloseTo(0.33, 14)
    expect(panels[index].size[1]).toBeCloseTo(0.11, 14)
  }
  expect(JSON.stringify(props)).toBe(before)
})

it("refuses absent, nonfinite, overflowing and numerically lost seam stock", () => {
  const props = { size: [0.5, 0.08, 0.3], seamAllowance: 0.015 } satisfies Parameters<typeof getSeamedBoxTextilePanels>[0]
  for (const invalid of [0, -1, NaN, Infinity]) {
    expect(getSeamedBoxTextilePanels({ ...props, seamAllowance: invalid })).toBeInstanceOf(Error)
    expect(getSeamedBoxTextilePanels({ ...props, size: [0.5, invalid, 0.3] })).toBeInstanceOf(Error)
  }
  expect(getSeamedBoxTextilePanels({ ...props, seamAllowance: Number.MAX_VALUE })).toBeInstanceOf(Error)
  expect(getSeamedBoxTextilePanels({ ...props, seamAllowance: Number.MIN_VALUE })).toBeInstanceOf(Error)
})
