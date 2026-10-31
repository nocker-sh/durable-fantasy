import { expect, it } from "vitest"
import { getShoeCapsule } from "#/world/scene/figure/get-shoe-capsule"

it.each(["boots", "shoes", "clogs", "wraps"] satisfies Parameters<typeof getShoeCapsule>[0]["kind"][])("keeps the rendered %s heel, toe and radius", (kind) => {
  const foot: [number, number, number] = [1, 2, 3]
  const ball: [number, number, number] = [1, 2, 4]
  const shoe = getShoeCapsule({ foot, ball, kind, scale: 1 })
  expect(shoe.a).toEqual([1, 1.996, 2.98])
  expect(shoe.b).toEqual([1, 2, kind === "clogs" ? 4.075 : 4.065])
  expect(shoe.r).toBe(kind === "shoes" || kind === "wraps" ? 0.068 : 0.078)
  expect(foot).toEqual([1, 2, 3])
  expect(ball).toEqual([1, 2, 4])
})

it("scales the child's shoe while retaining the original vertical heel offset", () => {
  const shoe = getShoeCapsule({ foot: [0, 1, 0], ball: [0, 1, 1], kind: "boots", scale: 0.74 })
  expect(shoe.a).toEqual([0, 0.996, -0.0148])
  expect(shoe.b[2]).toBeCloseTo(1.0481, 14)
  expect(shoe.r).toBe(0.078 * 0.74)
})

it("keeps a collapsed direction zero instead of inventing a heel-to-toe axis", () => {
  expect(getShoeCapsule({ foot: [1, 2, 3], ball: [1, 2, 3], kind: "shoes", scale: 1 })).toEqual({ a: [1, 1.996, 3], b: [1, 2, 3], r: 0.068 })
})
