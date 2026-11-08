import { expect, it } from "vitest"
import { storageLidPlan } from "#/world/town/storage-lid-plan"
import { storageLidState } from "#/world/town/storage-lid-state"
import { certifyStorageLid } from "#/world/town/certify-storage-lid"
import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
const box = { x0: 1, x1: 1.28, y0: 0.05, y1: 0.31, z0: 1, z1: 1.32 },
  handle = { axis: "z" as const, span: 0.08, depth: 0.018, height: 0.04, thickness: 0.003 },
  support = { x0: 1.6, x1: 2, z0: 0.9, z1: 1.5, bottom: 0, top: 0.36 }
const plan = () => storageLidPlan({ withdrawn: box, wall: 0.0015, lid: 0.0015, handle: handle, lift: 0.22, rest: [1.8, 0.36, 1.16] })
const section = { bounds: { x0: 0, x1: 3, z0: 0, z1: 3 }, ceiling: 2, obstacles: [support] }
it("sets the box on the floor and rests the entire cover on its support without moving the body again", () => {
  const p = plan(),
    first = storageLidState(p, 0),
    last = storageLidState(p, 3)
  expect(Math.min(...p.body.map((b) => b.y0))).toBe(0)
  expect(last.filter((b) => b.part === "bottom" || b.part === "side")).toEqual(first.filter((b) => b.part === "bottom" || b.part === "side"))
  const lid = last.find((p) => p.part === "lid")!
  expect(lid.y0).toBeCloseTo(support.top, 12)
  expect(lid.x0).toBeGreaterThanOrEqual(support.x0)
  expect(lid.x1).toBeLessThanOrEqual(support.x1)
  expect(certifyStorageLid(p, section)).toMatchObject({ pieces: 4, segments: 4 })
})
it("rejects a handle hitting an obstacle only between the clear endpoint states", () => {
  const p = plan(),
    obstacle = { x0: 1.47, x1: 1.48, z0: 1.198, z1: 1.199, bottom: 0.45, top: 0.455 }
  for (const offset of p.offsets)
    for (const part of p.cover)
      expect(cuboidTranslationHits({ relative: { x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 }, from: offset, to: offset, obstacle: obstacle })).toBe(false)
  expect(() => certifyStorageLid(p, { ...section, obstacles: [support, obstacle] })).toThrow("intersects an obstacle")
})
it("rejects insufficient lift, penetration into the support and a room without vertical clearance", () => {
  expect(() => storageLidPlan({ withdrawn: box, wall: 0.0015, lid: 0.0015, handle: handle, lift: 0.08, rest: [1.8, 0.36, 1.16] })).toThrow("does not clear")
  const low = storageLidPlan({ withdrawn: box, wall: 0.0015, lid: 0.0015, handle: handle, lift: 0.22, rest: [1.8, 0.34, 1.16] })
  expect(() => certifyStorageLid(low, section)).toThrow("intersects an obstacle")
  expect(() => certifyStorageLid(plan(), { ...section, ceiling: 0.4 })).toThrow("leaves its room")
})
it("does not accept a cover passing through its own body or nonfinite geometry", () => {
  const p = plan()
  p.offsets[1] = [0, -0.01, 0]
  expect(() => certifyStorageLid(p, section)).toThrow("intersects an obstacle")
  expect(() => certifyStorageLid(plan(), { ...section, obstacles: [{ ...support, top: NaN }] })).toThrow("Invalid storage lid movement geometry")
})

it("rejects a lid that starts displaced or a closing state disconnected from the withdrawn box", () => {
  const displaced = plan()
  displaced.offsets[0] = [0.02, 0, 0]
  expect(() => certifyStorageLid(displaced, section)).toThrow("does not join its closed box")
  const changed = plan()
  changed.original[0].y0 -= 0.005
  expect(() => certifyStorageLid(changed, section)).toThrow("does not join its closed box")
})
