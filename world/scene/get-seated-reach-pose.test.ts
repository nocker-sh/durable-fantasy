import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import { getSeatedNativePose } from "#/world/scene/get-seated-native-pose"
import { getSeatedReachPose } from "#/world/scene/get-seated-reach-pose"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { BONE_ORDER } from "#/world/scene/rig"

it("preserves both native arm lengths, seated support and every uninvolved bone", () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-1.md", import.meta.url), "utf8"))
  const chair = room.furniture?.find((furniture) => furniture.symbol === "A"),
    table = room.furniture?.find((furniture) => furniture.symbol === "T")
  if (!chair || !table || !room.grid) throw new Error("Missing dining geometry")
  const geometry = getDiningSeatGeometry({ chair, table, cell: room.grid.cell_m })
  if (geometry instanceof Error) throw geometry
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ヴィルヘルム")]
  const base = getSeatedNativePose({ look, frame: 0, place: geometry.place })
  if (base instanceof Error) throw base
  const before = structuredClone(base.skeleton)
  const target = [2.75, 0.84, 2.6] satisfies [number, number, number]
  const pose = getSeatedReachPose({ look, frame: 0, place: geometry.place, target, hand: "r", pole: [-1, 1, 0] })
  if (pose instanceof Error) throw pose
  const lengths = armGripLengths(base.skeleton, "r"),
    shoulder = pose.skeleton.p.upperarm_r
  expect(Math.hypot(...pose.solution.elbow.map((value, axis) => value - shoulder[axis]))).toBeCloseTo(lengths.upper, 12)
  expect(Math.hypot(...pose.solution.wrist.map((value, axis) => value - pose.solution.elbow[axis]))).toBeCloseTo(lengths.forearm, 12)
  const grip = toHeadingWorldPoint(pose.solution.grip, pose.root, geometry.place.heading)
  for (const axis of [0, 1, 2]) expect(grip[axis]).toBeCloseTo(target[axis], 12)
  expect(pose.root).toEqual(base.root)
  for (const bone of BONE_ORDER) if (bone !== "lowerarm_r" && bone !== "hand_r") expect(pose.skeleton.p[bone]).toEqual(base.skeleton.p[bone])
  expect(base.skeleton).toEqual(before)
})
