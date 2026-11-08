import { expect, it } from "vitest"
import { getRoundBarGripProfile } from "#/world/scene/figure/get-round-bar-grip-profile"
import { getRoundBarContactError } from "#/world/scene/figure/get-round-bar-contact-error"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { crossVector3 as cross } from "#/lib/engine/cross-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
const fixture = () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    skeleton = skelFor(look, "idle", 0)
  const elbow = skeleton.p.lowerarm_l,
    wrist = skeleton.p.hand_l,
    centre = armGripPoint(elbow, wrist),
    direction = norm(sub(wrist, elbow)),
    first = norm(cross(direction, [0, 0, 1])),
    second = norm(cross(direction, first))
  return { skeleton, elbow, wrist, centre, direction, first, second }
}
it("encloses round bars in different palm orientations without changing the forearm and cuff", () => {
  const f = fixture()
  for (const axis of [f.first, f.second, norm(add(f.first, f.second)), mul(f.first, -1)])
    for (const bodyScale of [1, 0.74]) {
      const bar = { from: add(f.centre, mul(axis, -0.08)), to: add(f.centre, mul(axis, 0.08)), radius: 0.006 }
      const grip = getRoundBarGripProfile({ skeleton: f.skeleton, hand: "l", bar, bodyScale })
      if (grip instanceof Error) throw grip
      const posed = { ...f.skeleton, handGrips: { l: grip } },
        shoulder = f.skeleton.p.upperarm_l
      expect(getRoundBarContactError({ skeleton: posed, hand: "l", bar })).toBeNull()
      const raw = nativeArmSurfaces({ scale: bodyScale, shoulder: shoulder, elbow: f.elbow, wrist: f.wrist }),
        held = nativeArmSurfaces({ scale: bodyScale, shoulder: shoulder, elbow: f.elbow, wrist: f.wrist, grip: grip })
      expect(held.arm.sd(f.centre)).toBeGreaterThan(0)
      expect(raw.arm.sd(f.centre)).toBeLessThan(0)
      for (const distance of [-0.001, -0.02, -0.05]) {
        const point = add(f.wrist, mul(f.direction, distance))
        expect(held.arm.sd(point)).toBe(raw.arm.sd(point))
        expect(held.cuff.sd(point)).toBe(raw.cuff.sd(point))
      }
    }
})
it("rejects degenerate, oversized and disagreeing grip geometry", () => {
  const f = fixture(),
    bar = { from: add(f.centre, mul(f.first, -0.08)), to: add(f.centre, mul(f.first, 0.08)), radius: 0.006 }
  const grip = getRoundBarGripProfile({ skeleton: f.skeleton, hand: "l", bar, bodyScale: 1 })
  if (grip instanceof Error) throw grip
  expect(getRoundBarGripProfile({ skeleton: f.skeleton, hand: "l", bar: { ...bar, radius: 1 }, bodyScale: 1 })).toBeInstanceOf(Error)
  expect(getRoundBarGripProfile({ skeleton: f.skeleton, hand: "l", bar: { ...bar, to: bar.from }, bodyScale: 1 })).toBeInstanceOf(Error)
  expect(getRoundBarGripProfile({ skeleton: f.skeleton, hand: "l", bar, bodyScale: NaN })).toBeInstanceOf(Error)
  for (const invalid of [
    { ...grip, across: grip.axis },
    { ...grip, halfWidth: 0 },
    { ...grip, axis: mul(grip.axis, 2) },
  ]) {
    expect(getRoundBarContactError({ skeleton: { ...f.skeleton, handGrips: { l: invalid } }, hand: "l", bar })).toBeInstanceOf(Error)
  }
  expect(getRoundBarContactError({ skeleton: { ...f.skeleton, handGrips: { l: grip } }, hand: "l", bar: { ...bar, to: bar.from } })).toBeInstanceOf(Error)
})
