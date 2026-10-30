import { getWaterVesselNativeParts } from "#/world/scene/figure/get-water-vessel-native-parts"
import { getWaterJarBodyError } from "#/world/scene/figure/get-water-jar-body-error"
import { getWaterHandleBodyError } from "#/world/scene/figure/get-water-handle-body-error"
import { subtractVector3 as sub } from "../../lib/engine/subtract-vector3"
import { getPaddedPoseFrame } from "#/world/scene/figure/get-padded-pose-frame"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWaterVesselDefinition } from "#/scripts/lib/get-water-vessel-definition"
import { potableWaterSupplySchema } from "#/scripts/lib/potable-water-supply-schema"
import { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import { getWaterGripBarError } from "#/world/scene/figure/get-water-grip-bar-error"
import { getWaterVesselPrimitive } from "#/world/scene/figure/get-water-vessel-primitive"
import { buildBody } from "#/world/scene/figure/body"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FRAMES } from "#/world/scene/figure/animation"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { FIG } from "#/world/scene/figure/display-scale"
import { TILE_M } from "#/world/town/fit"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
const fixture = () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-2.md", import.meta.url), "utf8")),
    vessel = room.furniture?.find((part) => part.symbol === "W")
  if (!vessel) throw new Error("Missing water vessel")
  const definition = getWaterVesselDefinition(vessel),
    review = potableWaterSupplySchema.parse(room.potable_water_supply).grip_review
  if (definition instanceof Error) throw definition
  if (!review) throw new Error("Missing grip proposal")
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")]
  return { definition, review, look }
}
it("solves all native frames without changing shoulders, feet or bone lengths", () => {
  const f = fixture()
  for (const animation of ["idle", "look", "carry"] satisfies ("idle" | "look" | "carry")[])
    for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
      const skeleton = skelFor(f.look, animation, frame),
        posed = getHeldWaterVesselPose({ look: f.look, skeleton, parts: f.definition.parts, position: f.review.position_body_m, scale: FIG * TILE_M, poles: f.review.poles })
      if (posed instanceof Error) throw posed
      for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
        expect(posed.skeleton.p[`upperarm_${hand}`]).toEqual(skeleton.p[`upperarm_${hand}`])
        expect(posed.skeleton.p[`foot_${hand}`]).toEqual(skeleton.p[`foot_${hand}`])
        const lengths = armGripLengths(skeleton, hand)
        expect(Math.hypot(...sub(posed.skeleton.p[`lowerarm_${hand}`], posed.skeleton.p[`upperarm_${hand}`]))).toBeCloseTo(lengths.upper, 12)
        expect(Math.hypot(...sub(posed.skeleton.p[`hand_${hand}`], posed.skeleton.p[`lowerarm_${hand}`]))).toBeCloseTo(lengths.forearm, 12)
      }
      expect(posed.skeleton.q).toBe(skeleton.q)
    }
})
it("uses real palm openings around the bar, retaining skin beyond the opening", () => {
  const f = fixture(),
    posed = getHeldWaterVesselPose({ look: f.look, skeleton: skelFor(f.look, "carry", 0), parts: f.definition.parts, position: f.review.position_body_m, scale: FIG * TILE_M, poles: f.review.poles })
  if (posed instanceof Error) throw posed
  const body = buildBody(f.look, posed.skeleton, null)
  for (const part of posed.parts) {
    if (part.kind !== "capsule" || part.section !== "grip") continue
    expect(getWaterGripBarError({ skeleton: posed.skeleton, bar: part })).toBeNull()
    const centre = armGripPoint(posed.skeleton.p[`lowerarm_${part.side}`], posed.skeleton.p[`hand_${part.side}`]),
      arm = body.armParts[part.side][0]
    if (!arm.sd) throw new Error("Missing native skin field")
    expect(arm.sd(centre)).toBeGreaterThan(0)
    expect(Math.abs(arm.sd([centre[0] + part.radius, centre[1], centre[2]]))).toBeLessThan(1e-10)
    expect(arm.sd([centre[0] + part.radius * 1.5, centre[1], centre[2]])).toBeLessThan(0)
  }
})
it("keeps the cavity hollow and rejects a grip beyond native reach", () => {
  const f = fixture(),
    wall = f.definition.parts.find((part) => part.kind === "tube")
  if (!wall || wall.kind !== "tube") throw new Error("Missing hollow wall")
  const primitive = getWaterVesselPrimitive(wall)
  if (primitive instanceof Error) throw primitive
  if (!primitive.sd) throw new Error("Missing hollow field")
  const height = (wall.bottom + wall.top) / 2
  expect(primitive.sd([0, height, 0])).toBeGreaterThan(0)
  expect(primitive.sd([(wall.radius + wall.innerRadius) / 2, height, 0])).toBeLessThan(0)
  expect(getHeldWaterVesselPose({ look: f.look, skeleton: skelFor(f.look, "idle", 0), parts: f.definition.parts, position: [0, 0.73, 2], scale: FIG * TILE_M, poles: f.review.poles })).toBeInstanceOf(
    Error,
  )
})
it("requires the real grip opening and refuses a bar continuing behind the cuff", () => {
  const f = fixture(),
    posed = getHeldWaterVesselPose({ look: f.look, skeleton: skelFor(f.look, "idle", 0), parts: f.definition.parts, position: f.review.position_body_m, scale: FIG * TILE_M, poles: f.review.poles })
  if (posed instanceof Error) throw posed
  const bar = posed.parts.find((part) => part.kind === "capsule" && part.section === "grip" && part.side === "l")
  if (!bar || bar.kind !== "capsule") throw new Error("Missing grip bar")
  expect(getWaterGripBarError({ skeleton: { ...posed.skeleton, handGrips: undefined }, bar })).toBeInstanceOf(Error)
  expect(getWaterGripBarError({ skeleton: posed.skeleton, bar: { ...bar, radius: NaN } })).toEqual(new Error("Invalid water grip certificate geometry"))
  expect(getWaterGripBarError({ skeleton: posed.skeleton, bar: { ...bar, from: [bar.from[0], bar.from[1] - 0.3, bar.from[2]], to: [bar.to[0], bar.to[1] + 0.3, bar.to[2]] } })).toEqual(
    new Error("Water handle reaches behind the native cuff plane"),
  )
})

it("renders the same held parts through the native depth pass without clipping the padded frame", () => {
  const f = fixture(),
    posed = getHeldWaterVesselPose({ look: f.look, skeleton: skelFor(f.look, "carry", 0), parts: f.definition.parts, position: f.review.position_body_m, scale: FIG * TILE_M, poles: f.review.poles })
  if (posed instanceof Error) throw posed
  const base = { look: f.look, skeleton: posed.skeleton, item: null, padding: 16, blink: false }
  const empty = getPaddedPoseFrame({ ...base, view: 0 }),
    held = getPaddedPoseFrame({ ...base, view: 0, extraPrimitives: posed.primitives })
  if (empty instanceof Error) throw empty
  if (held instanceof Error) throw held
  expect(held.pixels.data).not.toEqual(empty.pixels.data)
  for (const view of [0, 1, 2, 3, 4, 5, 6, 7]) {
    const image = getPaddedPoseFrame({ ...base, view, extraPrimitives: posed.primitives })
    if (image instanceof Error) throw image
    for (let x = 0; x < image.pixels.w; x++) {
      expect(image.pixels.alpha(x, 0)).toBe(0)
      expect(image.pixels.alpha(x, image.pixels.h - 1)).toBe(0)
    }
    for (let y = 0; y < image.pixels.h; y++) {
      expect(image.pixels.alpha(0, y)).toBe(0)
      expect(image.pixels.alpha(image.pixels.w - 1, y)).toBe(0)
    }
  }
})

it("checks the jar and non-grip struts against the body instead of exempting whole handles", () => {
  const f = fixture(),
    posed = getHeldWaterVesselPose({ look: f.look, skeleton: skelFor(f.look, "idle", 0), parts: f.definition.parts, position: f.review.position_body_m, scale: FIG * TILE_M, poles: f.review.poles })
  if (posed instanceof Error) throw posed
  const misplaced = getWaterVesselNativeParts({ parts: f.definition.parts, position: [0, 0.73, 0], scale: FIG * TILE_M, rootY: posed.rootY })
  if (misplaced instanceof Error) throw misplaced
  expect(getWaterJarBodyError({ look: f.look, skeleton: posed.skeleton, parts: misplaced })).toBeInstanceOf(Error)
  const from = posed.skeleton.p.spine_01,
    to = posed.skeleton.p.spine_02,
    middle: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]
  expect(buildBody(f.look, posed.skeleton, null).prims.some((part) => part.sd && part.sd(middle) < 0)).toBe(true)
  const intrusive = posed.parts.map((part) =>
    part.kind === "capsule" && part.section === "upper" && part.side === "l"
      ? { ...part, from: [middle[0] - 0.02, middle[1], middle[2]] satisfies [number, number, number], to: [middle[0] + 0.02, middle[1], middle[2]] satisfies [number, number, number] }
      : part,
  )
  expect(getWaterHandleBodyError({ look: f.look, skeleton: posed.skeleton, parts: intrusive })?.message).toBe("Water l upper handle clearance remains unresolved")
})
