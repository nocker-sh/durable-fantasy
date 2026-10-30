import type { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
import type { getPouringPotGripPose } from "#/world/scene/figure/get-pouring-pot-grip-pose"
import type { Skel } from "#/world/scene/rig"
import type { getHotWaterServiceDefinition } from "#/scripts/lib/get-hot-water-service-definition"
import type { getHotWaterPouringReview } from "#/scripts/lib/get-hot-water-pouring-review"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Look } from "#/world/scene/figure/look"
import type { hotWaterAnimationSchema } from "./hot-water-animation-schema"
import type { z } from "zod"
export type HotWaterFrameContext = Readonly<{
  room: SettingDocument
  definition: Exclude<ReturnType<typeof getHotWaterServiceDefinition>, Error>
  review: Exclude<ReturnType<typeof getHotWaterPouringReview>, Error>
  look: Look
}>

export type HotWaterPoseContext = HotWaterFrameContext & Readonly<{ skeleton: Skel; body: readonly [number, number]; pose: Exclude<ReturnType<typeof getPouringPotPose>, Error> }>
export type HotWaterPosedContext = HotWaterPoseContext & Readonly<{ posed: Exclude<ReturnType<typeof getPouringPotGripPose>, Error> }>
export type HotWaterAnimation = z.infer<typeof hotWaterAnimationSchema>
export type HotWaterAnimationContext = HotWaterFrameContext & Readonly<{ animation: HotWaterAnimation; frame: number }>
export type HotWaterReviewInput = Readonly<{ room: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; definition: HotWaterFrameContext["definition"] }>
