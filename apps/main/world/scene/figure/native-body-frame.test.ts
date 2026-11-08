import { getWaterSupportBodyError } from "#/world/scene/figure/get-water-support-body-error"
import { getWaterPickupFloorError } from "#/scripts/lib/get-water-pickup-floor-error"
import { readFileSync } from "node:fs"
import { expect, it, vi } from "vitest"
import * as bodyModule from "#/world/scene/figure/body"
import { createNativeBodyFrame } from "#/world/scene/figure/create-native-body-frame"
import { getNativeBody } from "#/world/scene/figure/get-native-body"
import { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import { getWaterPickupProposal } from "#/scripts/lib/get-water-pickup-proposal"
import { readSetting } from "#/scripts/lib/read-setting"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
const fixture = () => {
  const room = readSetting(readFileSync(".docs/settings/rooms/room-h1-2.md", "utf8"))
  const documents = new Map(
    ["ゾフィー", "ゴットフリート", "ハインリヒ"].map((name) => {
      const resident = readSetting(readFileSync(`.docs/settings/residents/resident-${name}.md`, "utf8"))
      return [resident.id, resident]
    }),
  )
  const proposal = getWaterPickupProposal({ room, documents })
  if (!proposal || proposal instanceof Error) throw proposal ?? new Error("Missing water proposal")
  return proposal
}
it("builds the incoming and solved body only once each while retaining every held-vessel clearance check", () => {
  const proposal = fixture()
  const skeleton = skelFor(proposal.look, "idle", 0)
  const spy = vi.spyOn(bodyModule, "buildBody")
  try {
    expect(getHeldWaterVesselPose({ look: proposal.look, skeleton, parts: proposal.support.definition.parts, position: proposal.position, scale: 1, poles: proposal.grip.poles })).not.toBeInstanceOf(
      Error,
    )
    expect(spy).toHaveBeenCalledTimes(2)
  } finally {
    spy.mockRestore()
  }
})
it("shares only the exact look and pose and refuses a frame from another input", () => {
  const proposal = fixture()
  const skeleton = skelFor(proposal.look, "idle", 0)
  const native = createNativeBodyFrame(proposal.look, skeleton)
  expect(getNativeBody({ look: proposal.look, skeleton, native })).toBe(native.body)
  expect(getNativeBody({ look: { ...proposal.look }, skeleton, native })).toEqual(new Error("Native body frame belongs to a different pose or look"))
  expect(getNativeBody({ look: proposal.look, skeleton: { ...skeleton }, native })).toEqual(new Error("Native body frame belongs to a different pose or look"))
  expect(getNativeBody({ look: proposal.look, skeleton })).not.toBeInstanceOf(Error)
})

it("shares one solved body across shelf and floor checks without skipping either clearance", () => {
  const proposal = fixture()
  const room = readSetting(readFileSync(".docs/settings/rooms/room-h1-2.md", "utf8"))
  const posed = getHeldWaterVesselPose({
    look: proposal.look,
    skeleton: skelFor(proposal.look, "idle", 0),
    parts: proposal.support.definition.parts,
    position: proposal.position,
    scale: 1,
    poles: proposal.grip.poles,
  })
  if (posed instanceof Error) throw posed
  const spy = vi.spyOn(bodyModule, "buildBody")
  try {
    const native = createNativeBodyFrame(proposal.look, posed.skeleton)
    const support = { look: proposal.look, skeleton: posed.skeleton, native, body: proposal.review.body_m, rootY: posed.rootY, heading: proposal.heading, parts: proposal.support.parts }
    const floor = { room, symbol: proposal.furniture.symbol, look: proposal.look, posed, body: proposal.review.body_m, heading: proposal.heading, native }
    expect(getWaterSupportBodyError(support)).toBeNull()
    expect(getWaterPickupFloorError(floor)).toBeNull()
    expect(spy).toHaveBeenCalledTimes(1)
    const wrong = createNativeBodyFrame(proposal.look, { ...posed.skeleton })
    expect(getWaterSupportBodyError({ ...support, native: wrong })).toEqual(new Error("Native body frame belongs to a different pose or look"))
    expect(getWaterPickupFloorError({ ...floor, native: wrong })).toEqual(new Error("Native body frame belongs to a different pose or look"))
  } finally {
    spy.mockRestore()
  }
})
