import { expect, it } from "vitest"
import { storageBoxParts } from "#/world/town/storage-box-parts"
import { storageBoxInterior } from "#/world/town/storage-box-interior"
import type { StorageBoxHandle } from "#/world/town/storage-box-types"
const bounds = { x0: 2, y0: 3, z0: 4, x1: 2.35, y1: 3.25, z1: 4.35 }
it("offsets a real lid handle toward its user without changing the original boards or usable cavity", () => {
  const handle: StorageBoxHandle = { axis: "z", span: 0.28, depth: 0.02, height: 0.14, thickness: 0.01, offset: [0, -0.44] }
  const plain = { x0: 1.5, x1: 2.5, y0: 0, y1: 0.48, z0: 4, z1: 4.5 }
  const parts = storageBoxParts({ bounds: { ...plain, y1: 0.62 }, wall: 0.025, lid: 0.025, lift: 0, handle: handle })
  expect(parts.filter((part) => part.part !== "lid-handle")).toEqual(storageBoxParts({ bounds: plain, wall: 0.025, lid: 0.025 }))
  const wood = parts.filter((part) => part.part === "lid-handle")
  expect(wood).toHaveLength(3)
  expect(wood.every((part) => part.x0 >= plain.x0 && part.x1 <= plain.x1 && part.z0 >= plain.z0 && part.z1 <= plain.z1 && part.y0 >= plain.y1)).toBe(true)
  expect(Math.min(...wood.map((part) => part.x0))).toBeCloseTo(1.55)
  expect(Math.max(...wood.map((part) => part.x1))).toBeCloseTo(1.57)
  for (const offset of [
    [0, -0.5],
    [0.2, 0],
    [NaN, 0],
  ])
    expect(() => storageBoxParts({ bounds: { ...plain, y1: 0.62 }, wall: 0.025, lid: 0.025, lift: 0, handle: { ...handle, offset: [offset[0], offset[1]] } })).toThrow("lid handle")
})
it("uses exactly the material outside the same usable cavity", () => {
  const parts = storageBoxParts({ bounds: bounds, wall: 0.015, lid: 0.02 }),
    inner = storageBoxInterior({ width: 0.35, depth: 0.35, height: 0.25, wall: 0.015, lid: 0.02 })
  expect(parts).toHaveLength(6)
  expect(parts.filter((p) => p.part === "side")).toHaveLength(4)
  const material = parts.reduce((v, p) => v + (p.x1 - p.x0) * (p.y1 - p.y0) * (p.z1 - p.z0), 0)
  expect(material).toBeCloseTo(0.35 * 0.35 * 0.25 - inner.volume, 12)
  for (const p of parts) expect([p.x1 - p.x0, p.y1 - p.y0, p.z1 - p.z0].every((n) => n > 0)).toBe(true)
})
it("lifts only the removable lid and rejects invalid opening positions", () => {
  const closed = storageBoxParts({ bounds: bounds, wall: 0.015, lid: 0.02 }),
    open = storageBoxParts({ bounds: bounds, wall: 0.015, lid: 0.02, lift: 0.1 })
  expect(open.slice(0, 5)).toEqual(closed.slice(0, 5))
  expect(open[5].y0 - closed[5].y0).toBeCloseTo(0.1)
  expect(open[5].y1 - closed[5].y1).toBeCloseTo(0.1)
  for (const lift of [-0.1, NaN, Infinity]) expect(() => storageBoxParts({ bounds: bounds, wall: 0.015, lid: 0.02, lift: lift })).toThrow("lid lift")
})

it("keeps the handle within the outer height without adding its space to the cavity", () => {
  const handle = { span: 0.08, depth: 0.018, height: 0.04, thickness: 0.003, axis: "x" as const },
    bounds = { x0: 0, y0: 0, z0: 0, x1: 0.32, y1: 0.26, z1: 0.28 },
    body = { width: 0.32, depth: 0.28, height: 0.22, wall: 0.0015, lid: 0.0015 },
    parts = storageBoxParts({ bounds: bounds, wall: 0.0015, lid: 0.0015, lift: 0, handle: handle }),
    raised = storageBoxParts({ bounds: bounds, wall: 0.0015, lid: 0.0015, lift: 0.08, handle: handle })
  expect(storageBoxInterior({ ...body, height: 0.26, lidHandle: handle }).volume).toBeCloseTo(storageBoxInterior(body).volume, 12)
  expect(parts.filter((p) => p.part === "lid-handle")).toHaveLength(3)
  expect(Math.max(...parts.map((p) => p.y1))).toBeCloseTo(0.26, 12)
  const centre = { x: 0.16, y: 0.24, z: 0.14 }
  expect(parts.some((p) => centre.x > p.x0 && centre.x < p.x1 && centre.y > p.y0 && centre.y < p.y1 && centre.z > p.z0 && centre.z < p.z1)).toBe(false)
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].part === "lid" || parts[i].part === "lid-handle") {
      expect(raised[i].y0 - parts[i].y0).toBeCloseTo(0.08, 12)
      expect(raised[i].y1 - parts[i].y1).toBeCloseTo(0.08, 12)
    } else expect(raised[i]).toEqual(parts[i])
  }
})
it("rejects a handle that closes the finger opening or extends beyond the lid", () => {
  const box = { width: 0.32, depth: 0.28, height: 0.26, wall: 0.0015, lid: 0.0015 },
    handle = { span: 0.08, depth: 0.018, height: 0.04, thickness: 0.003 }
  for (const wrong of [
    { ...handle, span: 0.4 },
    { ...handle, thickness: 0.04 },
    { ...handle, height: NaN },
    { ...handle, depth: 0.4 },
  ])
    expect(() => storageBoxInterior({ ...box, lidHandle: wrong })).toThrow("lid handle")
})
