import { expect, it } from "vitest"
import { buildLegs } from "#/world/scene/figure/legs"
import { createBodyContext } from "#/world/scene/figure/context"
import { getNativeFootwear } from "#/world/scene/figure/get-native-footwear"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { RESIDENT_LOOKS } from "#/world/town/residents"
import type { Look } from "#/world/scene/figure/look"

it.each(["boots", "wraps", "shoes", "clogs"] satisfies NonNullable<Look["footwear"]>[])("keeps both %s shoes and leg ownership in construction order", (footwear) => {
  const look: Look = { ...RESIDENT_LOOKS[0], footwear }
  const skeleton = skelFor(look, "walk", 4)
  const context = createBodyContext(look, skeleton, null)
  const earlier = context.push({ kind: "sph", a: [9, 9, 9], b: [9, 9, 9], r: 1, r2: 0, m: () => ["skin", 0] })
  const legs = buildLegs(context)
  expect(legs.footwear).toEqual(getNativeFootwear(look, skeleton))
  expect(context.prims).toEqual([earlier, ...legs.parts.l, ...legs.parts.r])
  expect(legs.parts.l.at(-1)).toBe(legs.shoeParts.l)
  expect(legs.parts.r.at(-1)).toBe(legs.shoeParts.r)
  expect(legs.parts.l).not.toContain(earlier)
  expect(legs.parts.r).not.toContain(earlier)
  for (const primitive of legs.trouserParts) expect(context.prims).toContain(primitive)
  expect(context.prims.map((primitive) => primitive.id)).toEqual(context.prims.map((_primitive, index) => index))
})
