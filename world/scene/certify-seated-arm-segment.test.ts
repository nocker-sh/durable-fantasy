import { expect, it } from "vitest"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { getSeatedReachPose } from "#/world/scene/get-seated-reach-pose"
import { getSeatedArmClearanceError } from "#/world/scene/get-seated-arm-clearance-error"
import { certifySeatedArmSegment } from "#/world/scene/certify-seated-arm-segment"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"

const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ヴィルヘルム")]
const place = { at: [0, 0] satisfies [number, number], height: 0.358, heading: 0 }
const from = [-0.44, 0.75, 0] satisfies [number, number, number]
const to = [0.19, 0.75, 0] satisfies [number, number, number]
const pole = [-1, 1, 0] satisfies [number, number, number]
it("clears a continuous fixed-length segment with no obstacles", () => {
  const base = getSeatedNativePose({ look, place, frame: 0 })
  if (base instanceof Error) throw base
  const certified = certifySeatedArmSegment({ look, ...base, heading: 0, hand: "r", from, to, pole, obstacles: [] })
  if (certified instanceof Error) throw certified
  expect(certified.intervals[0].from).toEqual(from)
  expect(certified.intervals[0].from).not.toBe(from)
  expect(certified.intervals.at(-1)?.to).toEqual(to)
  expect(certified.intervals.at(-1)?.to).not.toBe(to)
  for (const index of certified.intervals.keys()) if (index > 0) expect(certified.intervals[index].from).toEqual(certified.intervals[index - 1].to)
})
it("rejects a thin obstacle between clear endpoints and midpoint", () => {
  const base = getSeatedNativePose({ look, place, frame: 0 })
  if (base instanceof Error) throw base
  const center = toHeadingWorldPoint([from[0] + (to[0] - from[0]) * 0.24, 0.75, 0], base.root, 0)
  const obstacles = [{ x0: center[0] - 0.001, x1: center[0] + 0.001, bottom: center[1] - 0.001, top: center[1] + 0.001, z0: center[2] - 0.001, z1: center[2] + 0.001 }]
  const midpoint = [(from[0] + to[0]) / 2, 0.75, 0] satisfies [number, number, number]
  for (const target of [from, midpoint, to]) {
    const pose = getSeatedReachPose({ look, place, frame: 0, target: toHeadingWorldPoint(target, base.root, 0), hand: "r", pole })
    if (pose instanceof Error) throw pose
    expect(getSeatedArmClearanceError({ look, ...pose, heading: 0, obstacles, margin: 0, movingHand: null })).toBeNull()
  }
  expect(certifySeatedArmSegment({ look, ...base, heading: 0, hand: "r", from, to, pole, obstacles })).toEqual(new Error("Seated arm continuous clearance remains unresolved"))
})
it("starts at the exact original elbow and wrist when the native elbow is the fixed pole", () => {
  const base = getSeatedNativePose({ look, place, frame: 0 })
  if (base instanceof Error) throw base
  const elbow = base.skeleton.p.lowerarm_r,
    wrist = base.skeleton.p.hand_r
  const solved = solveArmGrip({ skeleton: base.skeleton, side: "r", target: armGripPoint(elbow, wrist), pole: elbow })
  expect(solved).toBeDefined()
  if (!solved) throw new Error("Native arm cannot reproduce its own pose")
  for (const axis of [0, 1, 2]) {
    expect(solved.elbow[axis]).toBeCloseTo(elbow[axis], 12)
    expect(solved.wrist[axis]).toBeCloseTo(wrist[axis], 12)
  }
})
it("rejects unreachable endpoints and invalid target geometry before subdivision", () => {
  const base = getSeatedNativePose({ look, place, frame: 0 })
  if (base instanceof Error) throw base
  expect(certifySeatedArmSegment({ look, ...base, heading: 0, hand: "r", from, to: [2, 2, 2], pole, obstacles: [] })).toEqual(new Error("Seated arm segment is unreachable without stretching"))
  expect(certifySeatedArmSegment({ look, ...base, heading: 0, hand: "r", from, to: [NaN, 0, 0], pole, obstacles: [] })).toEqual(new Error("Invalid seated arm segment"))
})

it("rejects a segment through the chain's inner unreachable ball despite reachable endpoints", () => {
  const base = getSeatedNativePose({ look, place, frame: 0 })
  if (base instanceof Error) throw base
  const shoulder = base.skeleton.p.upperarm_r
  const a = [shoulder[0] - 0.1, shoulder[1], shoulder[2]] satisfies [number, number, number]
  const b = [shoulder[0] + 0.1, shoulder[1], shoulder[2]] satisfies [number, number, number]
  expect(solveArmGrip({ skeleton: base.skeleton, side: "r", target: a, pole: pole })).toBeDefined()
  expect(solveArmGrip({ skeleton: base.skeleton, side: "r", target: b, pole: pole })).toBeDefined()
  expect(certifySeatedArmSegment({ look, ...base, heading: 0, hand: "r", from: a, to: b, pole, obstacles: [] })).toEqual(new Error("Seated arm segment is unreachable without stretching"))
})
