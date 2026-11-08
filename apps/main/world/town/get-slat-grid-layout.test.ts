import { expect, it } from "vitest"
import { getSlatGridLayout } from "#/world/town/get-slat-grid-layout"

const grid = { width: 0.42, depth: 0.42, frameWidth: 0.01, frameThickness: 0.005, barWidth: 0.005, barThickness: 0.005, gap: 0.015, footWidth: 0.01, footHeight: 0.03 }
it("supports both ends of every bar on the frame at a common height", () => {
  const layout = getSlatGridLayout(grid)
  if (layout instanceof Error) throw layout
  const frames = layout.sections.filter((section) => section.part === "frame")
  const bars = layout.sections.filter((section) => section.part === "slat")

  expect(frames).toHaveLength(4)
  expect(bars.length).toBeGreaterThan(1)
  for (const bar of bars) {
    expect(bar.y0).toBe(grid.frameThickness)
    expect(bar.y1).toBe(layout.top)
    expect(bar.z0).toBeLessThan(frames[0].z1)
    expect(bar.z1).toBeGreaterThan(frames[1].z0)
    expect(bar.x0).toBeGreaterThanOrEqual(grid.frameWidth)
    expect(bar.x1).toBeLessThanOrEqual(grid.width - grid.frameWidth)
  }
})
it.each([{ frameWidth: 0.3 }, { barWidth: 0.5 }, { gap: NaN }, { barThickness: 0 }, { barWidth: 1e-9, gap: 1e-9 }])("rejects impossible or unbounded bar layouts: %j", (change) => {
  expect(getSlatGridLayout({ ...grid, ...change })).toBeInstanceOf(Error)
})

it("connects the tray floor to all four frame corners with full foot faces", () => {
  const layout = getSlatGridLayout(grid)
  if (layout instanceof Error) throw layout
  const feet = layout.sections.filter((section) => section.part === "foot")
  expect(feet).toHaveLength(4)
  for (const foot of feet) {
    expect(foot.y0).toBe(-grid.footHeight)
    expect(foot.y1).toBe(0)
    expect(layout.sections.some((frame) => frame.part === "frame" && frame.y0 === foot.y1 && frame.x0 <= foot.x0 && frame.x1 >= foot.x1 && frame.z0 <= foot.z0 && frame.z1 >= foot.z1)).toBe(true)
  }
  expect(layout.height).toBe(layout.top - layout.bottom)
  expect(getSlatGridLayout({ ...grid, footWidth: 0.02 })).toBeInstanceOf(Error)
})
