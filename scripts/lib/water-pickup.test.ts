import { workTableSections } from "#/world/town/work-table"
import { buildBody } from "#/world/scene/figure/body"
import { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getWaterPickupProposal } from "#/scripts/lib/get-water-pickup-proposal"
import { getWaterPickupReviewError } from "#/scripts/lib/get-water-pickup-review-error"
import { getWaterVesselSupport } from "#/scripts/lib/get-water-vessel-support"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const fixture = () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-2.md", import.meta.url), "utf8"))
  const documents = new Map<string, SettingDocument>()
  for (const name of ["ゾフィー", "ゴットフリート", "ハインリヒ"]) {
    const resident = readSetting(readFileSync(new URL(`../../.docs/settings/residents/resident-${name}.md`, import.meta.url), "utf8"))
    documents.set(resident.id, resident)
  }
  const furniture = room.furniture?.find((part) => part.symbol === "W")
  if (!furniture) throw new Error("Missing water slot")
  return { room, documents, furniture }
}
it("keeps all 54 indoor pickup frames clear of the wall shelf and neighboring fixtures", () => {
  const f = fixture()
  expect(getWaterPickupReviewError(f)).toBeNull()
  const proposal = getWaterPickupProposal(f)
  if (!proposal || proposal instanceof Error) throw proposal
  expect(proposal.position[1]).toBe(proposal.support.support.height_m)
  expect(proposal.position[2]).toBeCloseTo(0.27, 12)
  expect(proposal.support.parts).toHaveLength(4)
})
it("rejects a shelf placed across the west door and a jar leaving its top", () => {
  const f = fixture(),
    support = getWaterVesselSupport(f.room, f.furniture)
  if (support instanceof Error) throw support
  expect(getWaterVesselSupport(f.room, { ...f.furniture, rect: [1, 5, 1, 1] })).toEqual(new Error("Water shelf is not attached to its declared west wall"))
  expect(getWaterVesselSupport(f.room, { ...f.furniture, potable_vessel_support: { ...support.support, vessel_at_m: [0.35, 0.25] } })).toEqual(
    new Error("Water vessel base or handles leave the shelf top"),
  )
})
it("requires every overlapping operation and the actual shelf maker", () => {
  const f = fixture(),
    proposal = getWaterPickupProposal(f)
  if (!proposal || proposal instanceof Error) throw proposal
  const supply = f.room.potable_water_supply
  if (!supply || typeof supply !== "object") throw new Error("Missing supply")
  const room = { ...f.room, potable_water_supply: { ...supply, pickup_review: { ...proposal.review, exclusive_with: ["F", "V"] } } }
  expect(getWaterPickupReviewError({ ...f, room })).toEqual(new Error("Water pickup shares operating floor with U"))
  f.documents.delete(proposal.support.support.maker)
  expect(getWaterPickupReviewError(f)).toEqual(new Error("Water shelf has no registered maker prerequisite"))
})
it("refuses an unreachable supported jar without changing the carrier", () => {
  const f = fixture(),
    support = getWaterVesselSupport(f.room, f.furniture)
  if (support instanceof Error) throw support
  const room = { ...f.room, furniture: f.room.furniture?.map((part) => (part.symbol === "W" ? { ...part, potable_vessel_support: { ...support.support, height_m: 1.7 } } : part)) }
  expect(getWaterPickupReviewError({ ...f, room })).toBeInstanceOf(Error)
})

it("retains the real shoe collision that ruled out a four-legged stand", () => {
  const f = fixture(),
    proposal = getWaterPickupProposal(f)
  if (!proposal || proposal instanceof Error) throw proposal
  const posed = getHeldWaterVesselPose({
    look: proposal.look,
    skeleton: skelFor(proposal.look, "idle", 0),
    parts: proposal.support.definition.parts,
    position: proposal.position,
    scale: 1,
    poles: proposal.grip.poles,
  })
  if (posed instanceof Error) throw posed
  const shoes = Object.values(buildBody(proposal.look, posed.skeleton, null).footwear)
  const legs = workTableSections({ surface: { height: 0.73, thickness: 0.03, legWidth: 0.04, legInset: 0.03, kneeClearance: 0.2 }, x: 0.75, z: 3.25, width: 0.28, depth: 0.5 }).filter(
    (part) => part.part === "leg",
  )
  const collisions = legs.flatMap((part) => {
    const box = toHeadingLocalCuboid({
      box: { x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 },
      root: [proposal.review.body_m[0], posed.rootY, proposal.review.body_m[1]],
      heading: proposal.heading,
    })
    if (box instanceof Error) throw box
    return shoes.filter((shoe) => segmentCuboidDistance(box, shoe.a, shoe.b) < shoe.r)
  })
  expect(collisions.length).toBeGreaterThan(0)
})
