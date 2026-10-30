import { expect, it } from "vitest"
import { getNativeLegCapsuleExternalError } from "#/world/scene/figure/get-native-leg-capsule-external-error"

it("requires the complete motion margin between a native leg capsule and furniture", () => {
  const props = {
    capsules: [{ a: [0, 0.5, 0], b: [0, 0.7, 0], r: 0.05 }],
    margin: 0,
    rootY: 0,
    ceiling: 2,
    boxes: [{ x0: 0.08, x1: 0.12, z0: -0.1, z1: 0.1, bottom: 0.4, top: 0.8 }],
  } satisfies Parameters<typeof getNativeLegCapsuleExternalError>[0]
  expect(getNativeLegCapsuleExternalError(props)).toBeNull()
  expect(getNativeLegCapsuleExternalError({ ...props, margin: 0.04 })).toEqual(new Error("Native leg interval clearance from a solid remains unresolved"))
  expect(getNativeLegCapsuleExternalError({ ...props, margin: 0.6, boxes: [] })).toEqual(new Error("Native leg interval leaves its floor or ceiling"))
})

it("refuses missing or invalid interval geometry instead of silently granting clearance", () => {
  const props = { capsules: [{ a: [0, 0.5, 0], b: [0, 0.7, 0], r: 0.05 }], margin: 0, rootY: 0, ceiling: 2, boxes: [] } satisfies Parameters<typeof getNativeLegCapsuleExternalError>[0]
  expect(getNativeLegCapsuleExternalError({ ...props, capsules: [] })).toBeInstanceOf(Error)
  expect(getNativeLegCapsuleExternalError({ ...props, margin: NaN })).toBeInstanceOf(Error)
  expect(getNativeLegCapsuleExternalError({ ...props, boxes: [{ x0: NaN, x1: 1, z0: 0, z1: 1, bottom: 0, top: 1 }] })).toBeInstanceOf(Error)
})
