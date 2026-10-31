import { expect, it } from "vitest"
import { getNativeFootwear } from "#/world/scene/figure/get-native-footwear"
import { buildBody } from "#/world/scene/figure/body"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import type { Look } from "#/world/scene/figure/look"

const look: Look = { sex: "f", skin: "skin1", hair: "hBrown", style: "bob", top: "cLinen" }
it.each(["boots", "shoes", "clogs", "wraps"] satisfies NonNullable<Look["footwear"]>[])("matches actual %s rendering for adults and children without mutating the pose", (footwear) => {
  for (const age of ["adult", "child"] satisfies NonNullable<Look["age"]>[]) {
    const appearance: Look = { ...look, age, footwear }
    const skeleton = skelFor(appearance, "walk", 6)
    const before = JSON.stringify({ appearance, skeleton })
    expect(getNativeFootwear(appearance, skeleton)).toEqual(buildBody(appearance, skeleton, null).footwear)
    expect(JSON.stringify({ appearance, skeleton })).toBe(before)
  }
})

it("uses the same default boot, robe and explicitly disabled boot choices as the renderer", () => {
  for (const appearance of [look, { ...look, robe: true }, { ...look, boots: false }]) {
    const skeleton = skelFor(appearance, "idle", 0)
    const shoes = getNativeFootwear(appearance, skeleton)
    expect(shoes).toEqual(buildBody(appearance, skeleton, null).footwear)
    expect(shoes).not.toBe(getNativeFootwear(appearance, skeleton))
  }
})
