import { expect, it } from "vitest"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { lerpVector3 as lerp3 } from "../../../lib/engine/lerp-vector3"
import { scaleVector3 as mul } from "../../../lib/engine/scale-vector3"
import { addVector3 as add } from "../../../lib/engine/add-vector3"
import { type Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"
it("keeps the cuff behind the wrist instead of burying the palm grip in a rounded cap", () => {
  const shoulder: V3 = [0, 0.5, 0],
    elbow: V3 = [0, 0.3, 0],
    wrist: V3 = [0, 0.15, 0],
    grip = armGripPoint(elbow, wrist),
    former = limbSd([lerp3(elbow, wrist, 0.68), lerp3(elbow, wrist, 0.98)], [0.057, 0.062]),
    shape = nativeArmSurfaces({ scale: 1, shoulder: shoulder, elbow: elbow, wrist: wrist })
  expect(former.sd(grip)).toBeLessThan(0)
  expect(shape.cuff.sd(grip)).toBeGreaterThan(0)
  expect(shape.arm.sd(grip)).toBeLessThan(0)
  const middle = lerp3(elbow, wrist, 0.83)
  expect(shape.cuff.sd(add(middle, [0.05, 0, 0]))).toBeLessThan(0)
})
it("keeps the wrist boundary in every arm direction and native body scale", () => {
  for (const direction of [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ] as V3[])
    for (const scale of [1, 0.74]) {
      const wrist: V3 = [0.2, 0.4, 0.1],
        elbow = add(wrist, mul(direction, -0.15 * scale)),
        shoulder = add(elbow, mul(direction, -0.17 * scale)),
        shape = nativeArmSurfaces({ scale: scale, shoulder: shoulder, elbow: elbow, wrist: wrist })
      for (const distance of [0.001, 0.02, 0.05]) expect(shape.cuff.sd(add(wrist, mul(direction, distance)))).toBeGreaterThanOrEqual(distance - 1e-12)
    }
})

it("opens four handle contact faces while retaining the forearm and skin classification", () => {
  const wrist: V3 = [0, 0.15, 0],
    elbow: V3 = [0, 0.3, 0],
    shoulder: V3 = [0, 0.47, 0],
    grip = armGripPoint(elbow, wrist),
    shape = nativeArmSurfaces({ scale: 1, shoulder: shoulder, elbow: elbow, wrist: wrist, grip: { axis: [0, 0, 1], across: [1, 0, 0], halfWidth: 0.003, halfDepth: 0.004 } }),
    raw = nativeArmSurfaces({ scale: 1, shoulder: shoulder, elbow: elbow, wrist: wrist })
  expect(shape.arm.sd(grip)).toBeGreaterThan(0)
  expect(raw.arm.sd(grip)).toBeLessThan(0)
  for (const [direction, half] of [
    [[1, 0, 0], 0.003],
    [[0, 1, 0], 0.004],
  ] as [V3, number][])
    for (const sign of [-1, 1]) {
      const hit = { i: 0 }
      expect(shape.arm.sd(add(grip, mul(direction, sign * half)), hit)).toBeCloseTo(0, 12)
      expect(hit.i).toBeGreaterThanOrEqual(2)
      expect(shape.arm.sd(add(grip, mul(direction, sign * (half - 0.0001))))).toBeGreaterThan(0)
      expect(shape.arm.sd(add(grip, mul(direction, sign * (half + 0.0001))))).toBeLessThan(0)
    }
  for (const point of [elbow, lerp3(elbow, wrist, 0.5), add(wrist, [0.02, 0.01, 0])]) expect(shape.arm.sd(point) < 0).toBe(raw.arm.sd(point) < 0)
})
it("rejects oversized and nonorthogonal palm openings", () => {
  for (const profile of [
    { axis: [0, 0, 1] as V3, across: [0, 0, 1] as V3, halfWidth: 0.003, halfDepth: 0.003 },
    { axis: [0, 0, 1] as V3, across: [1, 0, 0] as V3, halfWidth: 0.1, halfDepth: 0.003 },
  ])
    expect(() => nativeArmSurfaces({ scale: 1, shoulder: [0, 0.5, 0], elbow: [0, 0.3, 0], wrist: [0, 0.15, 0], grip: profile })).toThrow("Invalid native palm grip profile")
})
