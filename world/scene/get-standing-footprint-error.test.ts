import { expect, it } from "vitest"
import { getStandingFootprintError } from "#/world/scene/get-standing-footprint-error"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FIG } from "#/world/scene/figure/display-scale"
import { TILE_M } from "#/world/town/fit"
const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")]
it("encloses the rendered body under all cardinal headings", () => {
  for (const heading of [0, Math.PI / 2, Math.PI, Math.PI * 1.5])
    expect(getStandingFootprintError({ look, skeleton: skelFor(look, "carry", 8), position: [0, 0], heading, scale: FIG * TILE_M, area: [-0.5, -0.5, 0.5, 0.5] })).toBeNull()
})
it("rejects a centre inside the zone when its actual body parts leave the floor", () => {
  expect(getStandingFootprintError({ look, skeleton: skelFor(look, "idle", 0), position: [0.45, 0], heading: 0, scale: FIG * TILE_M, area: [-0.5, -0.5, 0.5, 0.5] })?.message).toBe(
    "Standing body leaves its assigned floor",
  )
})
it("does not use an invalid transform or an empty floor to approve a body", () => {
  const props = {
    look,
    skeleton: skelFor(look, "idle", 0),
    position: [0, 0] satisfies [number, number],
    heading: 0,
    scale: FIG * TILE_M,
    area: [-0.5, -0.5, 0.5, 0.5] satisfies [number, number, number, number],
  }
  expect(getStandingFootprintError({ ...props, scale: NaN })).toBeInstanceOf(Error)
  expect(getStandingFootprintError({ ...props, area: [0, 0, 0, 1] })).toBeInstanceOf(Error)
})
