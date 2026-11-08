import { expect, it } from "vitest"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { solveArmGripPose } from "#/world/scene/figure/solve-arm-grip-pose"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { certifySeatedElbowSwivel } from "#/world/scene/certify-seated-elbow-swivel"
import { getSeatedArmClearanceError } from "#/world/scene/get-seated-arm-clearance-error"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"

const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ヴィルヘルム")]
const place = { at: [0, 0] satisfies [number, number], height: 0.358, heading: 0 }
const fixture = () => {
  const base = getSeatedNativePose({ look, place, frame: 0 })
  if (base instanceof Error) throw base
  const shoulder = base.skeleton.p.upperarm_r
  return {
    base,
    target: [shoulder[0], shoulder[1], shoulder[2] + 0.2] satisfies [number, number, number],
    from: [shoulder[0] - 1, shoulder[1], shoulder[2]] satisfies [number, number, number],
    to: [shoulder[0], shoulder[1] + 1, shoulder[2]] satisfies [number, number, number],
  }
}
it("keeps the palm point and both bone lengths fixed through the pole motion", () => {
  const f = fixture(),
    lengths = armGripLengths(f.base.skeleton, "r")
  expect(certifySeatedElbowSwivel({ look, ...f.base, heading: 0, hand: "r", target: f.target, from: f.from, to: f.to, obstacles: [] })).not.toBeInstanceOf(Error)
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const pole = [f.from[0] + (f.to[0] - f.from[0]) * t, f.from[1] + (f.to[1] - f.from[1]) * t, f.from[2]] satisfies [number, number, number]
    const posed = solveArmGripPose({ skeleton: f.base.skeleton, hand: "r", target: f.target, pole })
    if (posed instanceof Error) throw posed
    for (const axis of [0, 1, 2]) expect(posed.solution.grip[axis]).toBeCloseTo(f.target[axis], 12)
    expect(Math.hypot(...posed.solution.elbow.map((value, axis) => value - f.base.skeleton.p.upperarm_r[axis]))).toBeCloseTo(lengths.upper, 12)
    expect(Math.hypot(...posed.solution.wrist.map((value, axis) => value - posed.solution.elbow[axis]))).toBeCloseTo(lengths.forearm, 12)
  }
})
it("rejects an elbow collision between clear endpoint poses", () => {
  const f = fixture(),
    pole = f.from.map((value, axis) => (value + f.to[axis]) / 2)
  const middle = solveArmGripPose({ skeleton: f.base.skeleton, hand: "r", target: f.target, pole: [pole[0], pole[1], pole[2]] })
  if (middle instanceof Error) throw middle
  const center = toHeadingWorldPoint(middle.solution.elbow, f.base.root, 0)
  const obstacles = [{ x0: center[0] - 0.001, x1: center[0] + 0.001, z0: center[2] - 0.001, z1: center[2] + 0.001, bottom: center[1] - 0.001, top: center[1] + 0.001 }]
  for (const endpoint of [f.from, f.to]) {
    const posed = solveArmGripPose({ skeleton: f.base.skeleton, hand: "r", target: f.target, pole: endpoint })
    if (posed instanceof Error) throw posed
    expect(getSeatedArmClearanceError({ look, skeleton: posed.skeleton, root: f.base.root, heading: 0, obstacles, margin: 0, movingHand: null })).toBeNull()
  }
  expect(certifySeatedElbowSwivel({ look, ...f.base, heading: 0, hand: "r", target: f.target, from: f.from, to: f.to, obstacles })).toEqual(
    new Error("Seated elbow swivel continuous clearance remains unresolved"),
  )
})
it("rejects a singular pole flip even without obstacles", () => {
  const f = fixture(),
    shoulder = f.base.skeleton.p.upperarm_r
  expect(certifySeatedElbowSwivel({ look, ...f.base, heading: 0, hand: "r", target: f.target, from: f.from, to: [shoulder[0] + 1, shoulder[1], shoulder[2]], obstacles: [] })).toEqual(
    new Error("Seated elbow swivel continuous clearance remains unresolved"),
  )
})
