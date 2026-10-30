import { expect, it } from "vitest"
import { getPaddedPoseFrame } from "#/world/scene/figure/get-padded-pose-frame"
import { getNativeSideStepPose } from "#/world/scene/figure/get-native-side-step-pose"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FW, FH, OX, OY } from "#/world/scene/figure/render"
import { renderSkeletonFrame } from "#/world/scene/figure/render-skeleton-frame"
import { PixelBuffer as PixBuf } from "../../../lib/graphics/pixel-buffer"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "エーリヒ")]
it.each([0, 1, 2, 3, 4, 5, 6, 7])("preserves native interior pixels and anchor alignment at view %s", (view) => {
  const skeleton = skelFor(look, "idle", 0),
    original = new PixBuf(FW, FH)
  renderSkeletonFrame({ L: look, skeleton: skeleton, view: view, item: null, out: original, ox: 0, oy: 0 })
  const frame = getPaddedPoseFrame({ look, skeleton, view, item: null, padding: 11, blink: false })
  if (frame instanceof Error) throw frame
  expect(frame.anchor).toEqual({ x: OX + 11, y: OY + 11 })
  for (const y of Array.from({ length: FH - 2 }, (_, i) => i + 1))
    for (const x of Array.from({ length: FW - 2 }, (_, i) => i + 1))
      for (const channel of [0, 1, 2, 3]) expect(frame.pixels.data[((y + 11) * frame.pixels.w + x + 11) * 4 + channel]).toBe(original.data[(y * FW + x) * 4 + channel])
})
it("recovers the clipped boots in the actual procedural side-step pose", () => {
  const pose = getNativeSideStepPose({ look, phase: 0.625, stride: 0.12, lift: 0.05, pelvisDrop: 0.02, direction: "left" })
  if (pose instanceof Error) throw pose
  const original = new PixBuf(FW, FH)
  renderSkeletonFrame({ L: look, skeleton: pose.skeleton, view: 0, item: null, out: original, ox: 0, oy: 0 })
  const frame = getPaddedPoseFrame({ look, skeleton: pose.skeleton, view: 0, item: null, padding: 12, blink: false })
  if (frame instanceof Error) throw frame
  const before = Array.from({ length: FW * FH }, (_, i) => original.data[i * 4 + 3]).filter(Boolean).length
  const after = Array.from({ length: frame.pixels.w * frame.pixels.h }, (_, i) => frame.pixels.data[i * 4 + 3]).filter(Boolean).length
  expect(after).toBeGreaterThan(before)
  for (const x of Array.from({ length: frame.pixels.w }).keys()) {
    expect(frame.pixels.alpha(x, 0)).toBe(0)
    expect(frame.pixels.alpha(x, frame.pixels.h - 1)).toBe(0)
  }
  for (const y of Array.from({ length: frame.pixels.h }).keys()) {
    expect(frame.pixels.alpha(0, y)).toBe(0)
    expect(frame.pixels.alpha(frame.pixels.w - 1, y)).toBe(0)
  }
})
it("rejects a padded viewport outside its buffer without changing pixels", () => {
  const skeleton = skelFor(look, "idle", 0)
  const pixels = new PixBuf(FW, FH)
  const before = pixels.data.slice()
  expect(renderSkeletonFrame({ L: look, skeleton: skeleton, view: 0, item: null, out: pixels, ox: 0, oy: 0, options: { padding: 12, blink: false } })).toBeInstanceOf(Error)
  expect(pixels.data).toEqual(before)
})
