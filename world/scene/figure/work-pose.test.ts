import { expect, it } from "vitest"
import { nativeWorkPose } from "#/world/scene/figure/native-work-pose"
import type { WorkPoseCandidate } from "#/world/scene/figure/work-pose"
import { createBodyContext } from "./context"
import { buildClothes } from "./clothes"
import { buildArms } from "./arms"
import { RESIDENTS, RESIDENT_LOOKS } from "../../town/residents"
import { quarterTurnPoint } from "../../../lib/engine/quarter-turn-point"
import { qrot } from "../../../lib/engine/qrot"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(...a.map((v, i) => v - b[i]))
it("aligns the actual native hand attachment to the grip and tool axis in every facing", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => r.name === "エーリヒ")]
  for (const facing of ["n", "e", "s", "w"] as const)
    for (const hand of ["l", "r"] as const) {
      const candidate: WorkPoseCandidate = { animation: "scrub", frame: 0, body_m: [5, 2], facing, hand, pole: [-1, 0, 1] },
        turn = facing === "s" ? 0 : facing === "w" ? 1 : facing === "n" ? 2 : 3
      const [dx, dz] = quarterTurnPoint(hand === "r" ? -0.25 : 0.25, 0.35, turn),
        target: [number, number, number] = [5 + dx, 0.4, 2 + dz],
        axis: [number, number, number] = [0.3, 0.4, 0.5]
      const pose = nativeWorkPose({ look: look, pose: candidate, target: target, gripAxis: axis }),
        context = createBodyContext(look, pose.skeleton, null),
        clothes = buildClothes(context),
        arms = buildArms({ ...context, ...clothes }),
        attachment = arms.hands[hand === "r" ? "R" : "L"]
      const [px, pz] = quarterTurnPoint(attachment.p[0], attachment.p[2], pose.turn),
        [ax, az] = quarterTurnPoint(attachment.up[0], attachment.up[2], pose.turn),
        length = Math.hypot(...axis)
      expect(distance([5 + px, attachment.p[1] + pose.rootY, 2 + pz], target)).toBeLessThan(1e-12)
      expect(
        distance(
          [ax, attachment.up[1], az],
          axis.map((v) => v / length),
        ),
      ).toBeLessThan(1e-12)
      expect(distance(qrot(pose.skeleton.q[`hand_${hand}`], [0, 0, 1]), attachment.up)).toBeLessThan(1e-12)
      const p = pose.skeleton.p,
        metrics = armGripLengths(pose.skeleton, hand)
      expect(distance(p[`upperarm_${hand}`], p[`lowerarm_${hand}`])).toBeCloseTo(metrics.upper, 12)
      expect(distance(p[`lowerarm_${hand}`], p[`hand_${hand}`])).toBeCloseTo(metrics.forearm, 12)
      const shifted = nativeWorkPose({
        look: look,
        pose: { ...candidate, body_m: [candidate.body_m[0] + 0.17, candidate.body_m[1] - 0.11] },
        target: [target[0] + 0.17, target[1], target[2] - 0.11],
        gripAxis: axis,
      })
      expect(distance(shifted.skeleton.p[`lowerarm_${hand}`], p[`lowerarm_${hand}`])).toBeLessThan(1e-12)
      expect(distance(shifted.skeleton.p[`hand_${hand}`], p[`hand_${hand}`])).toBeLessThan(1e-12)
      expect(shifted.rootY).toBe(pose.rootY)
    }
})
