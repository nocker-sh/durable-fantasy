import { expect, it, vi } from "vitest"
import * as THREE from "three"
import { Ashfall } from "#/world/scene/ashfall"

it("keeps the original grain trajectory with only four trigonometric calls per frame", () => {
  const random = vi.spyOn(Math, "random").mockReturnValue(0.5)
  const ash = new Ashfall()
  const before = Array.from(ash.points.geometry.attributes.position.array)
  const sin = vi.spyOn(Math, "sin")
  const cos = vi.spyOn(Math, "cos")
  try {
    ash.update({ dt: 1 / 60, t: 12.5, focus: new THREE.Vector3(2, 3, 4), night: 0.8 })
    expect(sin).toHaveBeenCalledTimes(2)
    expect(cos).toHaveBeenCalledTimes(2)
    sin.mockRestore()
    cos.mockRestore()
    const after = ash.points.geometry.attributes.position.array
    for (let i = 0; i < 1600; i++) {
      expect(after[i * 3]).toBeCloseTo(before[i * 3] + (Math.sin(5 + i) * 0.08) / 60 + 0.05 / 60, 8)
      expect(after[i * 3 + 1]).toBeCloseTo(before[i * 3 + 1] - Math.fround(0.425) / 60, 6)
      expect(after[i * 3 + 2]).toBeCloseTo(before[i * 3 + 2] + (Math.cos(3.75 + i * 1.7) * 0.06) / 60, 8)
    }
    expect(ash.points.position.toArray()).toEqual([2, 2, 4])
  } finally {
    sin.mockRestore()
    cos.mockRestore()
    random.mockRestore()
    ash.points.geometry.dispose()
    ;(ash.points.material as THREE.Material).dispose()
  }
})
