import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getPersonalBoxArmIntervalBounds } from "#/scripts/lib/get-personal-box-arm-interval-bounds"
import { getPersonalBoxMotionFrame } from "#/scripts/lib/get-personal-box-motion-frame"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
const distance = (first: readonly number[], second: readonly number[]) => Math.hypot(...first.map((value, axis) => value - second[axis]))

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("bounds native elbow, wrist and every uncut arm/cuff control point along both owners' vertical phases", () => {
  for (const number of [3, 4])
    for (const segment of [0, 2]) {
      const source = fixture(number),
        bounds = getPersonalBoxArmIntervalBounds({ ...source, segment })
      if (bounds instanceof Error) throw bounds
      const frames = Array.from({ length: 33 }, (_, index) => {
        const frame = getPersonalBoxMotionFrame({ ...source, segment, progress: index / 32 })
        if (frame instanceof Error) throw frame
        return frame
      })
      for (const hand of ["l", "r"] satisfies ("l" | "r")[])
        for (const index of frames.keys()) {
          if (!index) continue
          const a = frames[index - 1].posed.skeleton.p,
            b = frames[index].posed.skeleton.p,
            bound = bounds[hand]
          expect(distance(a[`lowerarm_${hand}`], b[`lowerarm_${hand}`]) * 32).toBeLessThanOrEqual(bound.elbow)
          expect(distance(a[`hand_${hand}`], b[`hand_${hand}`]) * 32).toBeLessThanOrEqual(bound.wrist)
          const first = nativeArmSurfaces({ scale: bound.scale, shoulder: a[`upperarm_${hand}`], elbow: a[`lowerarm_${hand}`], wrist: a[`hand_${hand}`] }),
            last = nativeArmSurfaces({ scale: bound.scale, shoulder: b[`upperarm_${hand}`], elbow: b[`lowerarm_${hand}`], wrist: b[`hand_${hand}`] })
          const from = [...first.arm.capsuleBounds(), ...first.uncutCuff.capsuleBounds()],
            to = [...last.arm.capsuleBounds(), ...last.uncutCuff.capsuleBounds()]
          for (const part of from.keys()) for (const end of ["a", "b"] satisfies ("a" | "b")[]) expect(distance(from[part][end], to[part][end]) * 32).toBeLessThanOrEqual(bound.surface)
        }
    }
})

it("keeps the unsupported lateral gait outside the stationary interval model", () => {
  for (const segment of [-1, 1, 3, NaN]) expect(getPersonalBoxArmIntervalBounds({ ...fixture(), segment })).toBeInstanceOf(Error)
})
