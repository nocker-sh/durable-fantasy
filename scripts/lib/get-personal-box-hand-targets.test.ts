import { expect, it } from "vitest"
import { storageBoxParts } from "#/world/town/storage-box-parts"
import { getPersonalBoxHandTargets } from "#/scripts/lib/get-personal-box-hand-targets"
const box = { x0: 1.5, x1: 2.5, y0: 0, y1: 0.62, z0: 4, z1: 4.5 }
const handle = { axis: "z", span: 0.28, depth: 0.02, height: 0.14, thickness: 0.01, offset: [0, -0.44] } satisfies NonNullable<Parameters<typeof storageBoxParts>[0]["handle"]>

it("derives targets from the actual raised wooden bridge at every lift without moving the board", () => {
  for (const lift of [0, 0.15]) {
    const parts = storageBoxParts({ bounds: box, wall: 0.025, lid: 0.025, lift: lift, handle: handle }),
      targets = getPersonalBoxHandTargets({ parts, target: "lid_handle", halfSpan: 0.05 })
    if (targets instanceof Error) throw targets
    expect(targets).toHaveLength(2)
    for (const point of targets) {
      expect(point[0]).toBeCloseTo(1.56)
      expect(point[1]).toBeCloseTo(0.615 + lift)
      expect(parts.some((part) => part.part === "lid-handle" && point[0] > part.x0 && point[0] < part.x1 && point[1] > part.y0 && point[1] < part.y1 && point[2] > part.z0 && point[2] < part.z1)).toBe(
        true,
      )
    }
  }
})

it("rejects invisible, wrongly oriented and out-of-span bridges instead of floating hand targets", () => {
  const plain = storageBoxParts({ bounds: box, wall: 0.025, lid: 0.025 })
  expect(getPersonalBoxHandTargets({ parts: plain, target: "lid_handle", halfSpan: 0.05 })).toBeInstanceOf(Error)
  const sideways = storageBoxParts({ bounds: box, wall: 0.025, lid: 0.025, lift: 0, handle: { ...handle, axis: "x", offset: [0, 0] } })
  expect(getPersonalBoxHandTargets({ parts: sideways, target: "lid_handle", halfSpan: 0.05 })).toBeInstanceOf(Error)
  const parts = storageBoxParts({ bounds: box, wall: 0.025, lid: 0.025, lift: 0, handle: handle })
  for (const halfSpan of [0, -0.1, NaN, Infinity, 0.2]) expect(getPersonalBoxHandTargets({ parts, target: "lid_handle", halfSpan })).toBeInstanceOf(Error)
})
