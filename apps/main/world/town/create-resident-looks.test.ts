import { expect, it } from "vitest"
import { createResidentLooks } from "#/world/town/create-resident-looks"
import type { Look } from "#/world/scene/figure/look"

const base: Look = { sex: "f", skin: "skin1", hair: "hBrown", style: "long", top: "cBlue" }

it("counts only missing fringes of each sex and keeps authored choices", () => {
  const looks = createResidentLooks([base, { ...base, sex: "m" }, { ...base, fringe: "back" }, base, { ...base, sex: "m" }])
  expect(looks.map((look) => look.fringe)).toEqual(["swept", "spiky", "back", "curtain", "blunt"])
  expect(looks.map((look) => look.neck)).toEqual(["muffler", "scarf", "muffler", "stole", "muffler"])
})

it("does not mutate source looks or override neck choices and helmets", () => {
  const authored = Object.freeze({ ...base, fringe: "back", neck: "scarf", neckRamp: "cRed", neckStripe: "cCream", hat: "helm" } satisfies Look)
  expect(createResidentLooks(Object.freeze([authored]))[0]).toBe(authored)
  const capped = Object.freeze({ ...base, hat: "cap" } satisfies Look)
  const rendered = createResidentLooks(Object.freeze([capped]))[0]
  expect(capped.hat).toBe("cap")
  expect(rendered.hat).toBeUndefined()
  expect(base.fringe).toBeUndefined()
  expect(base.neck).toBeUndefined()
})
