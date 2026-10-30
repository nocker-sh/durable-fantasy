import type { Look } from "#/world/scene/figure/look"
import { expect, it } from "vitest"
import { getDrapedSkirtGeometry } from "#/world/scene/figure/get-draped-skirt-geometry"
import { createBodyContext } from "#/world/scene/figure/context"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")]
it("conserves each layer's cloth length and keeps the frill to its hem band", () => {
  const context = createBodyContext(look, skelFor(look, "sit", 0), null)
  for (const layer of ["skirt", "overskirt", "frill"] satisfies ("skirt" | "overskirt" | "frill")[]) {
    const geometry = getDrapedSkirtGeometry(context, layer)
    if (geometry instanceof Error) throw geometry
    const profile = geometry.profile
    expect(profile.points.slice(1).reduce((sum, point, index) => sum + Math.hypot(...sub(point, profile.points[index])), 0)).toBeCloseTo(profile.total, 12)
    if (layer === "frill") {
      expect(geometry.shape.boxBounds()).toHaveLength(1)
      expect(geometry.shape.bounds.min[1]).toBeLessThan(context.hip[1])
      expect(geometry.shape.bounds.max[1]).toBeLessThan(context.hip[1])
    }
  }
})
it("puts additional length below the knee while a short skirt ends on the lap", () => {
  const shortLook: Look = { ...look, skirt: "short", frill: false, overskirt: undefined }
  const longLook: Look = { ...look, skirt: "long" }
  const short = getDrapedSkirtGeometry(createBodyContext(shortLook, skelFor(shortLook, "sit", 0), null), "skirt")
  const long = getDrapedSkirtGeometry(createBodyContext(longLook, skelFor(longLook, "sit", 0), null), "skirt")
  if (short instanceof Error) throw short
  if (long instanceof Error) throw long
  expect(short.profile.points[3][1]).toBe(short.profile.hip[1])
  expect(long.profile.points[3][1]).toBeLessThan(long.profile.hip[1])
  expect(long.profile.total).toBeGreaterThan(short.profile.total)
})

it("rejects invalid fold phases instead of building a reversed cloth path", () => {
  const context = createBodyContext(look, skelFor(look, "sit", 0), null)
  for (const fold of [NaN, 0, -1, 2]) expect(getDrapedSkirtGeometry({ ...context, fold }, "skirt")).toBeInstanceOf(Error)
})
