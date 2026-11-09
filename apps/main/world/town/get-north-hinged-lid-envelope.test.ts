import { expect, it } from "vitest"
import { getNorthHingedLidEnvelope } from "#/world/town/get-north-hinged-lid-envelope"
const source = { box: { x0: 2.08, x1: 2.4, y0: 1.175, y1: 1.255, z0: 4.02, z1: 4.23 }, lid: 0.005 }

it("contains every real lid corner throughout the rotation including the interior height extremum", () => {
  const sweep = getNorthHingedLidEnvelope(source)
  if (sweep instanceof Error) throw sweep
  const depth = source.box.z1 - source.box.z0,
    hinge = source.box.y1 - source.lid,
    peak = Math.atan2(depth, source.lid)
  for (const angle of [...Array.from({ length: 91 }, (unused, index) => (index * Math.PI) / 180), peak])
    for (const x of [source.box.x0, source.box.x1])
      for (const y of [0, source.lid])
        for (const z of [0, depth]) {
          const height = hinge + y * Math.cos(angle) + z * Math.sin(angle),
            north = source.box.z0 + z * Math.cos(angle) - y * Math.sin(angle)
          expect(x).toBeGreaterThanOrEqual(sweep.x0)
          expect(x).toBeLessThanOrEqual(sweep.x1)
          expect(height).toBeGreaterThanOrEqual(sweep.bottom - 1e-12)
          expect(height).toBeLessThanOrEqual(sweep.top + 1e-12)
          expect(north).toBeGreaterThanOrEqual(sweep.z0 - 1e-12)
          expect(north).toBeLessThanOrEqual(sweep.z1 + 1e-12)
        }
  expect(sweep.top).toBeGreaterThan(hinge + depth)
  expect(sweep.top).toBeCloseTo(hinge + source.lid * Math.cos(peak) + depth * Math.sin(peak), 14)
  expect(sweep.z0).toBeCloseTo(source.box.z0 - source.lid, 14)
})

it("rejects nonfinite or inverted geometry and overflow instead of certifying an unbounded rotation", () => {
  for (const invalid of [0, -1, NaN, Infinity, 0.08]) expect(getNorthHingedLidEnvelope({ ...source, lid: invalid })).toBeInstanceOf(Error)
  expect(getNorthHingedLidEnvelope({ ...source, box: { ...source.box, z1: source.box.z0 } })).toBeInstanceOf(Error)
  expect(getNorthHingedLidEnvelope({ box: { x0: 0, x1: 1, y0: 0, y1: Number.MAX_VALUE, z0: 0, z1: Number.MAX_VALUE }, lid: Number.MAX_VALUE / 4 })).toBeInstanceOf(Error)
})
