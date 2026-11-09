import { expect, it } from "vitest"
import { getCabinetTopPackagePlacement } from "#/world/town/get-cabinet-top-package-placement"
const fixture = () =>
  ({
    id: "spare-cover",
    origin: [0.08, 0, 0.03],
    size: [0.28, 0.04, 0.19],
    clearance: 0.01,
    bounds: { x0: 2, x1: 2.5, z0: 4, z1: 5, top: 1.175 },
    section: { bounds: { x0: 0, x1: 3, z0: 0, z1: 6.5 }, ceiling: 2.5, obstacles: [] },
  }) satisfies Parameters<typeof getCabinetTopPackagePlacement>[0]

it("puts the full package directly on its real cabinet top without changing the authored inputs", () => {
  const source = fixture(),
    before = JSON.stringify(source),
    box = getCabinetTopPackagePlacement(source)
  if (box instanceof Error) throw box
  expect(box.bottom).toBe(source.bounds.top)
  expect(box.x0).toBeCloseTo(2.08, 14)
  expect(box.x1 - box.x0).toBeCloseTo(0.28, 14)
  expect(box.top - box.bottom).toBeCloseTo(0.04, 14)
  expect(box.z1 - box.z0).toBeCloseTo(0.19, 14)
  expect(JSON.stringify(source)).toBe(before)
})

it("rejects overhang, floating packages, lost edge gaps, ceiling contact and room obstacles", () => {
  const source = fixture()
  for (const origin of [
    [0, 0, 0.03],
    [0.4, 0, 0.03],
    [0.08, 0.01, 0.03],
    [0.08, 0, 0.9],
  ] satisfies readonly [number, number, number][])
    expect(getCabinetTopPackagePlacement({ ...source, origin })).toBeInstanceOf(Error)
  expect(getCabinetTopPackagePlacement({ ...source, section: { ...source.section, ceiling: 1.215 } })).toBeInstanceOf(Error)
  expect(getCabinetTopPackagePlacement({ ...source, section: { ...source.section, obstacles: [{ x0: 2.1, x1: 2.2, z0: 4.1, z1: 4.15, bottom: 1.18, top: 1.2 }] } })).toBeInstanceOf(Error)
  for (const invalid of [0, -1, NaN, Infinity]) expect(getCabinetTopPackagePlacement({ ...source, size: [invalid, 0.04, 0.19] })).toBeInstanceOf(Error)
})
