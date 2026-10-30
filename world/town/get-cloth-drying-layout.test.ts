import { expect, it } from "vitest"
import { getClothDryingLayout } from "#/world/town/get-cloth-drying-layout"

const rack = {
  width: 0.5,
  depth: 0.5,
  railHeight: 0.95,
  railLength: 0.4,
  railDiameter: 0.02,
  rails: [0.12, 0.38],
  clothWidth: 0.3,
  clothLength: 0.5,
  clothThickness: 0.004,
  airGap: 0.08,
  trayInset: 0.02,
  trayTop: 0.12,
  floorClearance: 0.2,
}

it("reserves both folded cloths above the drip tray with separate air space", () => {
  const layout = getClothDryingLayout(rack)
  if (layout instanceof Error) throw layout

  expect(layout.panels).toHaveLength(2)
  expect(layout.panels[0].y0).toBeCloseTo(0.7)
  expect(layout.panels[1].x0 - layout.panels[0].x1).toBeGreaterThan(rack.airGap)
  for (const panel of layout.panels) {
    expect(panel.x0).toBeGreaterThan(layout.tray.x0)
    expect(panel.x1).toBeLessThan(layout.tray.x1)
    expect(panel.y0).toBeGreaterThan(layout.tray.top)
  }
})

it.each([
  { rails: [0.12, 0.12] },
  { rails: [0.12, 0.15] },
  { rails: [0.01, 0.38] },
  { clothWidth: 0.45 },
  { clothLength: 2 },
  { trayInset: 0.2 },
  { railHeight: NaN },
  { clothThickness: 0 },
  { rails: [] },
])("rejects cloth crossing the tray, floor or another cloth: %j", (change) => {
  expect(getClothDryingLayout({ ...rack, ...change })).toBeInstanceOf(Error)
})

it("rejects overflowing derived coordinates even when each input is finite", () => {
  expect(
    getClothDryingLayout({
      ...rack,
      width: Number.MAX_VALUE,
      depth: Number.MAX_VALUE,
      railHeight: Number.MAX_VALUE,
      railDiameter: Number.MAX_VALUE,
      railLength: Number.MAX_VALUE,
      rails: [Number.MAX_VALUE / 2],
    }),
  ).toBeInstanceOf(Error)
})
