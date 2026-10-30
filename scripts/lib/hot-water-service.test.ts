import { getHotWaterPosedFrame } from "#/scripts/lib/get-hot-water-posed-frame"
import { getHotWaterFrameContext } from "#/scripts/lib/get-hot-water-frame-context"
import { getHotWaterHoldingFrame } from "#/scripts/lib/get-hot-water-holding-frame"
import { getHotWaterHoldingReviewError } from "#/scripts/lib/get-hot-water-holding-review-error"
import { getHotWaterPotSpaceError } from "#/scripts/lib/get-hot-water-pot-space-error"
import { getPouringPotHeldPose } from "#/world/town/get-pouring-pot-held-pose"
import { hotWaterServiceSchema } from "#/scripts/lib/hot-water-service-schema"
import { getHotWaterTiltCandidateFrame } from "#/scripts/lib/get-hot-water-tilt-candidate-frame"
import { getPouringPotTiltPose } from "#/world/town/get-pouring-pot-tilt-pose"
import { getPouringPotBodyFields } from "#/world/scene/figure/get-pouring-pot-body-fields"
import { getPouringPotBodyError } from "#/world/scene/figure/get-pouring-pot-body-error"
import { getPouringPotNativeParts } from "#/world/scene/figure/get-pouring-pot-native-parts"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import { getRoundBarGripProfile } from "#/world/scene/figure/get-round-bar-grip-profile"
import { getRoundBarContactError } from "#/world/scene/figure/get-round-bar-contact-error"
import { lerpVector3 as lerp3 } from "../../lib/engine/lerp-vector3"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { getHotWaterReachFrame } from "#/scripts/lib/get-hot-water-reach-frame"
import { FRAMES } from "#/world/scene/figure/animation"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { armGripPoint } from "#/world/scene/figure/arm-grip-point"
import { readFileSync } from "node:fs"
import * as THREE from "three"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditHotWaterService } from "#/scripts/lib/audit-hot-water-service"
import { getHotWaterServiceDefinition } from "#/scripts/lib/get-hot-water-service-definition"
import { getHotWaterReachReviewError } from "#/scripts/lib/get-hot-water-reach-review-error"
import { getHotWaterPouringReview } from "#/scripts/lib/get-hot-water-pouring-review"
import { createPosedPouringPot } from "#/world/scene/construction/create-posed-pouring-pot"
import { getPosedPotBottom } from "#/world/town/get-posed-pot-bottom"
import { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
import { getHotWaterCupLayout } from "#/scripts/lib/get-hot-water-cup-layout"
import { applyWaterBatchCommand } from "#/world/core/apply-water-batch-command"
import { getHotWaterBatch } from "#/scripts/lib/get-hot-water-batch"
import { getPotStorageError } from "#/scripts/lib/get-pot-storage-error"
import { createPouringPot } from "#/world/scene/construction/create-pouring-pot"
import { createPouringPotBody } from "#/world/scene/construction/create-pouring-pot-body"
import { getPotHandleGeometry } from "#/world/scene/construction/get-pot-handle-geometry"
import { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import { getPouringPotLayout } from "#/world/town/get-pouring-pot-layout"
import { M } from "#/world/scene/construction/materials"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const fixture = () => {
  const documents = new Map<string, SettingDocument>()
  for (const id of ["room-h1-1", "room-h1-2", "room-h1-3", "room-h1-4", "room-h1-stairs", "room-h1-landing"]) {
    const room = readSetting(readFileSync(new URL(`../../.docs/settings/rooms/${id}.md`, import.meta.url), "utf8"))
    documents.set(room.id, room)
  }
  for (const name of ["ギュンター", "ゾフィー"]) {
    const resident = readSetting(readFileSync(new URL(`../../.docs/settings/residents/resident-${name}.md`, import.meta.url), "utf8"))
    documents.set(resident.id, resident)
  }
  const building = readSetting(readFileSync(new URL("../../.docs/settings/buildings/building-h1.md", import.meta.url), "utf8"))
  documents.set(building.id, building)
  const room = documents.get("room-h1-2")
  if (!room) throw new Error("Missing source kitchen")
  const definition = getHotWaterServiceDefinition({ room, documents })
  if (definition instanceof Error) throw definition
  return { room, documents, definition }
}
it("supports the complete pot and parked lid, stores the closed object, and accounts for all batch water", () => {
  const f = fixture(),
    d = f.definition,
    batch = getHotWaterBatch({ room: f.room, plan: d.plan })
  expect(auditHotWaterService(f.room, f.documents)).toEqual([])
  expect(getPotStorageError({ room: f.room, plan: d.plan, profile: d.profile })).toBeNull()
  if (batch instanceof Error) throw batch
  expect(batch.batch.volumeMl).toBe(500)
  expect(batch.batch.allocations.map((portion) => portion.amountMl)).toEqual([200, 200])
  expect(batch.batch.unallocatedMl).toBe(100)
  expect(batch.stock.volumeMl).toBe(2000)
  const first = applyWaterBatchCommand(batch.batch, { type: "pour", id: d.plan.portions[0].cup, amountMl: d.plan.portions[0].amount_ml })
  if (first instanceof Error) throw first
  const second = applyWaterBatchCommand(first, { type: "pour", id: d.plan.portions[1].cup, amountMl: d.plan.portions[1].amount_ml })
  if (second instanceof Error) throw second
  expect(second.volumeMl).toBe(100)
  expect(second.allocations.map((portion) => portion.pouredMl)).toEqual([200, 200])
  expect(batch.stock.volumeMl).toBe(2000)
  expect(d.profile.capacity * 1e6).toBeGreaterThan(d.plan.fill_ml)
  expect(d.layout.heating[1]).toBe(d.hearth.parts.plate.top)
  expect(d.layout.resting[1]).toBe(d.layout.heating[1])
})
it("rejects an unsupported or conflicting rest station and storage smaller than the fixed bridge", () => {
  const f = fixture(),
    d = f.definition,
    props = {
      profile: d.profile,
      stove: d.hearth.bounds,
      plate: d.hearth.parts.plate,
      masonry: d.hearth.parts.masonry,
      shaft: d.hearth.shaft,
      heating: d.plan.heating.position_m,
      resting: d.plan.rest.position_m,
      restArea: d.plan.rest.rect_m,
    }
  expect(getPouringPotLayout({ ...props, masonry: [] })).toEqual(new Error("Hot-pot rest area has no continuous masonry support"))
  expect(getPouringPotLayout({ ...props, resting: d.plan.heating.position_m })).toEqual(new Error("Pouring pot leaves its heating or resting surface"))
  expect(getPotStorageError({ room: f.room, profile: d.profile, plan: { ...d.plan, storage: { ...d.plan.storage, box: "C-tea-box" } } })).toBeInstanceOf(Error)
  expect(getPouringPotProfile({ ...d.profile.dimensions, fillLine: d.profile.dimensions.lipStart + 0.01 })).toBeInstanceOf(Error)
  expect(getPouringPotProfile({ ...d.profile.dimensions, lidRadius: d.profile.dimensions.diameter })).toBeInstanceOf(Error)
})
it("refuses unknown cups, excessive portions, a wrong supply and premature operation approval", () => {
  const f = fixture(),
    plan = f.definition.plan
  expect(getHotWaterBatch({ room: f.room, plan: { ...plan, portions: [{ cup: "missing-cup", amount_ml: 200 }] } })).toBeInstanceOf(Error)
  expect(getHotWaterBatch({ room: f.room, plan: { ...plan, portions: [{ ...plan.portions[0], amount_ml: 500 }] } })).toBeInstanceOf(Error)
  expect(getHotWaterBatch({ room: f.room, plan: { ...plan, filled_from: "Q" } })).toBeInstanceOf(Error)
  f.room.hot_water_service = { ...plan, empty_mass_kg: 6 }
  expect(auditHotWaterService(f.room, f.documents)).toContain("hot-water: Loaded pot has no matching home carrier or usable hand-load assumption")
  f.room.hot_water_service = plan
  f.room.design_gate = "通過"
  expect(auditHotWaterService(f.room, f.documents)).toContain("hot-water: Heating and daily handling remain unverified")
})
it("draws a hollow body with a connected pouring lip and a separate removable lid", () => {
  const profile = fixture().definition.profile,
    body = createPouringPotBody(profile)
  if (body instanceof Error) throw body
  body.updateMatrixWorld(true)
  const downward = new THREE.Raycaster(new THREE.Vector3(0.005, 0.2, 0), new THREE.Vector3(0, -1, 0)).intersectObject(body)
  expect(downward[0].point.y).toBeCloseTo(profile.dimensions.bottom, 7)
  const start = new THREE.Vector3(0.06, 0.135, 0),
    end = new THREE.Vector3(0.14, 0.15, 0),
    direction = end.clone().sub(start),
    path = new THREE.Raycaster(start, direction.clone().normalize(), 0, direction.length())
  expect(path.intersectObject(body)).toEqual([])
  body.geometry.dispose()
  for (const lid of ["seated", "absent"] satisfies ("seated" | "absent")[]) {
    const pot = createPouringPot({ profile, at: [0, 0, 0], heading: 0, lid })
    if (pot instanceof Error) throw pot
    pot.updateMatrixWorld(true)
    // Measure transformed vertices rather than rotating each diagonal bar's conservative local box.
    const box = new THREE.Box3().setFromObject(pot, true)
    for (const axis of [0, 1, 2]) {
      expect(box.min.getComponent(axis)).toBeGreaterThanOrEqual(profile.min[axis] - 1e-8)
      expect(box.max.getComponent(axis)).toBeLessThanOrEqual(profile.max[axis] + 1e-8)
    }
    expect(pot.children.filter((part) => part.name === "pot-lid")).toHaveLength(lid === "seated" ? 1 : 0)
    pot.traverse((part) => {
      if (part instanceof THREE.Mesh) {
        expect([M.iron, M.woodV]).toContain(part.material)
        part.geometry.dispose()
      }
    })
  }
})
it("leaves a real bore around the metal bar inside the wooden carrying grip", () => {
  const p = fixture().definition.profile,
    sleeve = p.handle.find((section) => section.material === "wood")
  if (!sleeve || sleeve.material !== "wood") throw new Error("Missing wooden grip")
  const geometry = getPotHandleGeometry(sleeve)
  if (geometry instanceof Error) throw geometry
  const attribute = geometry.getAttribute("position"),
    radii = Array.from({ length: attribute.count }, (_, index) => Math.hypot(attribute.getX(index), attribute.getZ(index)))
  expect(Math.min(...radii)).toBeGreaterThan(sleeve.innerRadius)
  expect(Math.min(...radii) * Math.cos(Math.PI / 12)).toBeCloseTo(sleeve.innerRadius, 8)
  geometry.dispose()
  expect(getPotHandleGeometry({ ...sleeve, innerRadius: sleeve.radius })).toBeInstanceOf(Error)
})

it("fits both registered cups on the cleared table and rejects edge, handle, allocation and support conflicts", () => {
  const f = fixture(),
    plan = f.definition.plan,
    serving = plan.serving,
    layout = getHotWaterCupLayout({ room: f.room, plan })
  if (layout instanceof Error) throw layout
  expect(layout.boxes.map((box) => box.id)).toEqual(plan.portions.map((portion) => portion.cup))
  expect(layout.boxes.map((box) => box.origin)).toEqual([
    [0.2, 0, 0.35],
    [0.6, 0, 0.35],
  ])
  expect(getHotWaterCupLayout({ room: f.room, plan: { ...plan, serving: { ...serving, cups: [serving.cups[0]] } } })).toBeInstanceOf(Error)
  expect(getHotWaterCupLayout({ room: f.room, plan: { ...plan, portions: [plan.portions[0], plan.portions[0]] } })).toBeInstanceOf(Error)
  expect(getHotWaterCupLayout({ room: f.room, plan: { ...plan, serving: { ...serving, cups: [serving.cups[0], serving.cups[0]] } } })).toBeInstanceOf(Error)
  expect(
    getHotWaterCupLayout({ room: f.room, plan: { ...plan, portions: [{ cup: "unknown-cup", amount_ml: 200 }], serving: { ...serving, cups: [{ cup: "unknown-cup", position_m: [0.2, 0.25] }] } } }),
  ).toBeInstanceOf(Error)
  for (const position of [
    [0.9, 0.25],
    [0.01, 0.25],
    [0.3, 0.25],
    [0.6, 0.4],
  ] satisfies [number, number][]) {
    expect(getHotWaterCupLayout({ room: f.room, plan: { ...plan, serving: { ...serving, cups: [serving.cups[0], { ...serving.cups[1], position_m: position }] } } })).toBeInstanceOf(Error)
  }
  expect(getHotWaterCupLayout({ room: f.room, plan: { ...plan, serving: { ...serving, space_index: 10 } } })).toBeInstanceOf(Error)
  const table = layout.table
  table.work_surface = { height_m: 0.01, thickness_m: 0.025, leg_width_m: 0.04, leg_inset_m: 0.06, knee_clearance_m: 0.1 }
  expect(getHotWaterCupLayout({ room: f.room, plan })).toBeInstanceOf(Error)
})

it("keeps the tilted body and fixed bridge above the cups with the true lip over each opening", () => {
  const f = fixture(),
    d = f.definition,
    review = getHotWaterPouringReview({ room: f.room, plan: d.plan, profile: d.profile })
  if (review instanceof Error) throw review
  expect(review.poses).toHaveLength(2)
  for (const placed of review.poses) {
    const pot = createPosedPouringPot({ profile: d.profile, pose: placed.pose })
    if (pot instanceof Error) throw pot
    pot.updateMatrixWorld(true)
    const lip = pot.localToWorld(new THREE.Vector3(d.profile.dimensions.diameter / 2 + d.profile.dimensions.lipLength, d.profile.dimensions.height, 0)),
      grip = pot.localToWorld(new THREE.Vector3(d.profile.dimensions.bailForward, d.profile.dimensions.bailHeight, 0)),
      measured = new THREE.Box3().setFromObject(pot, true)
    expect(lip.distanceTo(new THREE.Vector3(...placed.pose.lipAt))).toBeLessThan(1e-10)
    expect(grip.distanceTo(new THREE.Vector3(...placed.pose.gripAt))).toBeLessThan(1e-10)
    expect(placed.pose.lipAt[0]).toBeCloseTo((placed.cup === "cup-wilhelm" ? 0.2 : 0.6) + 0.0425, 10)
    expect(placed.pose.lipAt[2]).toBeCloseTo(0.3925, 10)
    expect(measured.min.y).toBeGreaterThanOrEqual(placed.bottom - 1e-8)
    expect(placed.bottom).toBeGreaterThan(0.815)
    expect(pot.children.some((part) => part.name === "pot-lid")).toBe(false)
    pot.traverse((part) => {
      if (part instanceof THREE.Mesh) part.geometry.dispose()
    })
  }
  const serving = d.plan.serving
  expect(getHotWaterPouringReview({ room: f.room, profile: d.profile, plan: { ...d.plan, serving: { ...serving, pose_review: { ...serving.pose_review, tilt_degrees: 0 } } } })).toBeInstanceOf(Error)
  for (const tilt of [-1, NaN, Math.PI]) expect(getPouringPotPose({ profile: d.profile, lipAt: [0, 1, 0], heading: 0, tilt })).toBeInstanceOf(Error)
})

it("encloses the rendered vessel below at every reviewed quarter-turn and forward tilt", () => {
  const profile = fixture().definition.profile
  for (const heading of [0, Math.PI / 2, Math.PI, -Math.PI / 2])
    for (const degrees of [0, 15, 30, 45, 60, 75, 90]) {
      const pose = getPouringPotPose({ profile, lipAt: [0.25, 1, 0.3], heading, tilt: (degrees * Math.PI) / 180 })
      if (pose instanceof Error) throw pose
      const pot = createPosedPouringPot({ profile, pose })
      if (pot instanceof Error) throw pot
      const bottom = getPosedPotBottom({ profile, pose }),
        bounds = new THREE.Box3().setFromObject(pot, true)
      expect(bounds.min.y).toBeGreaterThanOrEqual(bottom - 1e-8)
      expect(bounds.min.y - bottom).toBeLessThan(0.02)
      pot.traverse((part) => {
        if (part instanceof THREE.Mesh) part.geometry.dispose()
      })
    }
})

it("reaches both cups with the native carrier and rejects the old far grip, narrow hands and obstructed standing place", () => {
  const f = fixture(),
    d = f.definition,
    review = d.plan.serving.pose_review,
    reach = review.reach_review
  expect(getHotWaterReachReviewError({ room: f.room, documents: f.documents, definition: d })).toBeNull()
  const north = { ...d, plan: { ...d.plan, serving: { ...d.plan.serving, pose_review: { ...review, lip_facing: "n" } } } } satisfies typeof d
  expect(getHotWaterReachReviewError({ room: f.room, documents: f.documents, definition: north })?.message).toContain("cannot be reached with native arm lengths")
  const narrow = { ...d, plan: { ...d.plan, serving: { ...d.plan.serving, pose_review: { ...review, reach_review: { ...reach, grip_offset_m: 0.05 } } } } }
  expect(getHotWaterReachReviewError({ room: f.room, documents: f.documents, definition: narrow })?.message).toContain("forearm self-clearance")
  const close = { ...d, plan: { ...d.plan, serving: { ...d.plan.serving, pose_review: { ...review, reach_review: { ...reach, body_from_lip_m: [0, 0.2575] } } } } } satisfies typeof d
  expect(getHotWaterReachReviewError({ room: f.room, documents: f.documents, definition: close })?.message).toContain("clearance from the table or cups")
})

it("keeps shoulders, grounded feet and bone lengths in every source reach frame", () => {
  const f = fixture(),
    d = f.definition,
    look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    review = getHotWaterPouringReview({ room: f.room, plan: d.plan, profile: d.profile })
  if (review instanceof Error) throw review
  for (const placed of review.poses)
    for (const animation of d.plan.serving.pose_review.reach_review.animations)
      for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
        const reached = getHotWaterReachFrame({ room: f.room, definition: d, review, placed, look, animation, frame })
        if (reached instanceof Error) throw reached
        const original = reached.skeleton,
          changed = reached.posed.skeleton
        for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
          const lengths = armGripLengths(original, hand),
            shoulder = changed.p[`upperarm_${hand}`],
            elbow = changed.p[`lowerarm_${hand}`],
            wrist = changed.p[`hand_${hand}`],
            grip = armGripPoint(elbow, wrist)
          const contact = reached.posed.skeleton.handGrips?.[hand]
          if (!contact) throw new Error("Missing measured wooden grip opening")
          expect(getRoundBarContactError({ skeleton: changed, hand, bar: reached.posed.bar })).toBeNull()
          const raw = nativeArmSurfaces({ scale: 1, shoulder: shoulder, elbow: elbow, wrist: wrist }),
            held = nativeArmSurfaces({ scale: 1, shoulder: shoulder, elbow: elbow, wrist: wrist, grip: contact })
          expect(raw.arm.sd(grip)).toBeLessThan(0)
          expect(held.arm.sd(grip)).toBeGreaterThan(0)
          const forearm = lerp3(elbow, wrist, 0.5)
          expect(held.arm.sd(forearm)).toBe(raw.arm.sd(forearm))
          expect(held.cuff.sd(forearm)).toBe(raw.cuff.sd(forearm))
          expect(shoulder).toEqual(original.p[`upperarm_${hand}`])
          expect(Math.hypot(...elbow.map((value, axis) => value - shoulder[axis]))).toBeCloseTo(lengths.upper, 10)
          expect(Math.hypot(...wrist.map((value, axis) => value - elbow[axis]))).toBeCloseTo(lengths.forearm, 10)
          expect(Math.hypot(...grip.map((value, axis) => value - reached.posed.grips[hand][axis]))).toBeLessThan(1e-10)
          expect(changed.p[`foot_${hand}`]).toEqual(original.p[`foot_${hand}`])
          expect(changed.p[`ball_${hand}`]).toEqual(original.p[`ball_${hand}`])
        }
        expect(reached.posed.grips.l[0]).toBeGreaterThan(reached.posed.grips.r[0])
        expect(reached.posed.rootY).toBeGreaterThan(0)
      }
})

it("rejects a missing opening, oversized wood, and a whole bar continuing behind a cuff", () => {
  const f = fixture(),
    d = f.definition,
    look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    review = getHotWaterPouringReview({ room: f.room, plan: d.plan, profile: d.profile })
  if (review instanceof Error) throw review
  const reached = getHotWaterReachFrame({ room: f.room, definition: d, review, placed: review.poses[0], look, animation: "idle", frame: 0 })
  if (reached instanceof Error) throw reached
  const skeleton = reached.posed.skeleton,
    bar = reached.posed.bar
  expect(getRoundBarContactError({ skeleton: { ...skeleton, handGrips: undefined }, hand: "l", bar })).toBeInstanceOf(Error)
  expect(getRoundBarGripProfile({ skeleton, hand: "l", bar: { ...bar, radius: 0.1 }, bodyScale: 1 })).toBeInstanceOf(Error)
  expect(getRoundBarGripProfile({ skeleton, hand: "l", bar: { ...bar, to: bar.from }, bodyScale: 1 })).toBeInstanceOf(Error)
  expect(getRoundBarContactError({ skeleton, hand: "l", bar: { ...bar, radius: NaN } })).toBeInstanceOf(Error)
  const extended = { from: [-2, bar.from[1], bar.from[2]], to: [2, bar.from[1], bar.from[2]], radius: bar.radius } satisfies typeof bar
  const grip = getRoundBarGripProfile({ skeleton, hand: "l", bar: extended, bodyScale: 1 })
  if (grip instanceof Error) throw grip
  expect(getRoundBarContactError({ skeleton: { ...skeleton, handGrips: { ...skeleton.handGrips, l: grip } }, hand: "l", bar: extended })?.message).toBe(
    "Round bar reaches behind the native cuff plane",
  )
})

it("encloses every actual body/lip vertex and rejects narrow struts or a displaced pot against the native carrier", () => {
  const f = fixture(),
    d = f.definition,
    look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    review = getHotWaterPouringReview({ room: f.room, plan: d.plan, profile: d.profile })
  if (review instanceof Error) throw review
  const reached = getHotWaterReachFrame({ room: f.room, definition: d, review, placed: review.poses[0], look, animation: "idle", frame: 0 })
  if (reached instanceof Error) throw reached
  const source = d.plan.serving.pose_review.reach_review,
    props = {
      look,
      skeleton: reached.skeleton,
      profile: d.profile,
      pose: reached.pose,
      body: reached.body,
      heading: Math.PI,
      gripOffset: source.grip_offset_m,
      poles: source.poles,
      posed: reached.posed,
    },
    parts = getPouringPotNativeParts({ ...props, rootY: reached.posed.rootY })
  if (parts instanceof Error) throw parts
  expect(getPouringPotBodyError(props)).toBeNull()
  expect(parts.bars.map((bar) => bar.part)).toEqual(["root", "upright", "root", "upright", "bridge", "grip"])
  const pot = createPosedPouringPot({ profile: d.profile, pose: reached.pose })
  if (pot instanceof Error) throw pot
  pot.updateMatrixWorld(true)
  const body = pot.children.find((part) => part.name === "pot-body")
  if (!(body instanceof THREE.Mesh)) throw new Error("Missing actual body mesh")
  const fields = getPouringPotBodyFields({ ...props, rootY: reached.posed.rootY })
  if (fields instanceof Error) throw fields
  const cavityWorld = body.localToWorld(new THREE.Vector3(0, 0.05, 0)),
    cavity = toHeadingLocalPoint([cavityWorld.x, cavityWorld.y, cavityWorld.z], [reached.body[0], reached.posed.rootY, reached.body[1]], Math.PI)
  expect(fields.some((field) => field.value([...cavity]) < 0)).toBe(true)
  const vertices = body.geometry.getAttribute("position")
  for (const index of Array.from({ length: vertices.count }).keys()) {
    const vertex = body.localToWorld(new THREE.Vector3().fromBufferAttribute(vertices, index)),
      native = toHeadingLocalPoint([vertex.x, vertex.y, vertex.z], [reached.body[0], reached.posed.rootY, reached.body[1]], Math.PI)
    expect(fields.some((field) => field.value([...native]) <= 1e-8)).toBe(true)
    expect(native[0]).toBeGreaterThanOrEqual(parts.body.x0 - 1e-8)
    expect(native[0]).toBeLessThanOrEqual(parts.body.x1 + 1e-8)
    expect(native[1]).toBeGreaterThanOrEqual(parts.body.bottom - 1e-8)
    expect(native[1]).toBeLessThanOrEqual(parts.body.top + 1e-8)
    expect(native[2]).toBeGreaterThanOrEqual(parts.body.z0 - 1e-8)
    expect(native[2]).toBeLessThanOrEqual(parts.body.z1 + 1e-8)
  }
  pot.traverse((part) => {
    if (part instanceof THREE.Mesh) part.geometry.dispose()
  })
  const narrow = getPouringPotProfile({ ...d.profile.dimensions, bailSpan: 0.2 })
  if (narrow instanceof Error) throw narrow
  expect(getPouringPotBodyError({ ...props, profile: narrow })?.message).toContain("upright body clearance")
  const displaced = { ...reached.pose, at: [reached.body[0], 0.5, reached.body[1]] } satisfies typeof reached.pose
  expect(getPouringPotBodyError({ ...props, pose: displaced })?.message).toContain("body/lip clearance")
})

it("keeps the full tilt candidate unresolved when its real native body collides, while preserving the verified end pose", () => {
  const f = fixture(),
    d = f.definition,
    look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")],
    review = getHotWaterPouringReview({ room: f.room, plan: d.plan, profile: d.profile })
  if (review instanceof Error) throw review
  const props = { room: f.room, definition: d, review, placed: review.poses[0], look, animation: "idle", frame: 0 } satisfies Parameters<typeof getHotWaterReachFrame>[0],
    end = getHotWaterReachFrame(props)
  if (end instanceof Error) throw end
  const finalTilt = (d.plan.serving.pose_review.tilt_degrees * Math.PI) / 180
  const poseReview = d.plan.serving.pose_review,
    candidate = poseReview.tilt_candidate
  expect(
    hotWaterServiceSchema.safeParse({
      ...d.plan,
      serving: { ...d.plan.serving, pose_review: { ...poseReview, tilt_candidate: { ...candidate, upper_body: { ...candidate.upper_body, release_after_degrees: poseReview.tilt_degrees } } } },
    }).success,
  ).toBe(false)
  expect(getHotWaterTiltCandidateFrame({ ...props, tilt: 0 })).toBeInstanceOf(Error)
  const final = getHotWaterTiltCandidateFrame({ ...props, tilt: finalTilt })
  if (final instanceof Error) throw final
  for (const axis of [0, 1, 2]) expect(final.pose.at[axis]).toBeCloseTo(end.pose.at[axis], 10)
  for (const tilt of [-1, NaN, finalTilt + 0.01]) expect(getHotWaterTiltCandidateFrame({ ...props, tilt })).toBeInstanceOf(Error)
  for (const phase of Array.from({ length: 101 }, (_, index) => index / 100)) {
    const pose = getPouringPotTiltPose({
      profile: d.profile,
      finalPose: end.pose,
      heading: -Math.PI / 2,
      tilt: phase * finalTilt,
      finalTilt,
      backset: d.plan.serving.pose_review.tilt_candidate.grip_backset_m,
      clearancePlane: 0.845,
    })
    if (pose instanceof Error) throw pose
    expect(getPosedPotBottom({ profile: d.profile, pose })).toBeCloseTo(0.845, 10)
  }
  expect(f.room.design_gate).toBe("未通過")
})

it("rejects an upright kettle passing through the table even when the carrier clears it", () => {
  const f = fixture()
  const review = getHotWaterPouringReview({ room: f.room, plan: f.definition.plan, profile: f.definition.profile })
  if (review instanceof Error) throw review
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")]
  const context = { ...f, review, look, placed: review.poses[0], animation: "idle", frame: 0 } satisfies Parameters<typeof getHotWaterReachFrame>[0]
  const final = getHotWaterReachFrame(context)
  if (final instanceof Error) throw final
  const pose = getPouringPotHeldPose({ profile: f.definition.profile, heading: -Math.PI / 2, tilt: 0, gripAt: [final.pose.gripAt[0], 0.875, final.pose.gripAt[2]] })
  if (pose instanceof Error) throw pose
  const checked = getHotWaterPosedFrame({ ...context, body: final.body, skeleton: final.skeleton, pose })
  expect(checked).toBeInstanceOf(Error)
  if (!(checked instanceof Error)) throw new Error("Intersecting kettle was accepted")
  expect(checked.message).toContain("pot clearance from the table or cups")
})

it("rejects a kettle below the room floor even when it clears the table and cups", () => {
  const f = fixture()
  const review = getHotWaterPouringReview({ room: f.room, plan: f.definition.plan, profile: f.definition.profile })
  if (review instanceof Error) throw review
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => resident.name === "ゾフィー")]
  const context = { ...f, review, look, placed: review.poses[0], animation: "idle", frame: 0 } satisfies Parameters<typeof getHotWaterReachFrame>[0]
  const final = getHotWaterReachFrame(context)
  if (final instanceof Error) throw final
  const pose = getPouringPotHeldPose({ profile: f.definition.profile, heading: -Math.PI / 2, tilt: 0, gripAt: [final.pose.gripAt[0], 0.1, final.pose.gripAt[2] + 1] })
  if (pose instanceof Error) throw pose
  expect(getPosedPotBottom({ profile: f.definition.profile, pose })).toBeLessThan(0)
  expect(getHotWaterPotSpaceError({ ...context, body: final.body, skeleton: final.skeleton, posed: final.posed, pose })?.message).toContain("room floor")
  const raised = getPouringPotHeldPose({ profile: f.definition.profile, heading: -Math.PI / 2, tilt: 0, gripAt: [pose.gripAt[0], 1, pose.gripAt[2]] })
  if (raised instanceof Error) throw raised
  expect(getHotWaterPotSpaceError({ ...context, body: final.body, skeleton: final.skeleton, posed: final.posed, pose: raised })).toBeNull()
})

it("holds the same upright kettle outside the table through every native idle and look frame", () => {
  const f = fixture()
  const context = getHotWaterFrameContext(f)
  if (context instanceof Error) throw context
  const checked = { frames: 0 }
  for (const animation of ["idle", "look"] satisfies ("idle" | "look")[])
    for (const frame of Array.from({ length: FRAMES[animation] }).keys()) {
      const held = getHotWaterHoldingFrame({ ...context, animation, frame })
      if (held instanceof Error) throw new Error(`${animation}/${frame}: ${held.message}`, { cause: held })
      expect(held.pose.gripAt).toEqual(f.definition.plan.serving.pose_review.holding_review.grip_m)
      expect(held.body).toEqual(f.definition.plan.serving.pose_review.holding_review.body_m)
      checked.frames++
    }
  expect(checked.frames).toBe(FRAMES.idle + FRAMES.look)
  expect(getHotWaterHoldingReviewError(f)).toBeNull()
  expect(f.room.design_gate).toBe("未通過")
})

it("audits later holding frames even when the first one clears the entire station", () => {
  const f = fixture()
  const context = getHotWaterFrameContext(f)
  if (context instanceof Error) throw context
  const final = getHotWaterReachFrame({ ...context, placed: context.review.poses[0], animation: "idle", frame: 0 })
  if (final instanceof Error) throw final
  const plan = f.definition.plan
  const holding = {
    ...plan.serving.pose_review.holding_review,
    lean_degrees: 8,
    body_m: [final.body[0], final.body[1] + 0.2] satisfies [number, number],
    grip_m: [final.pose.gripAt[0], 0.85, final.pose.gripAt[2] + 0.2] satisfies [number, number, number],
  }
  const definition = { ...f.definition, plan: { ...plan, serving: { ...plan.serving, pose_review: { ...plan.serving.pose_review, holding_review: holding } } } }
  const changed = getHotWaterFrameContext({ ...f, definition })
  if (changed instanceof Error) throw changed
  expect(getHotWaterHoldingFrame({ ...changed, animation: "idle", frame: 0 })).not.toBeInstanceOf(Error)
  expect(getHotWaterHoldingReviewError({ ...f, definition })?.message).toContain("holding/idle/6")
  expect(auditHotWaterService({ ...f.room, hot_water_service: definition.plan }, f.documents).some((error) => error.includes("holding/idle/6"))).toBe(true)
})

it("checks the held kettle against room walls and other occupied cells as well as the station", () => {
  const f = fixture()
  const context = getHotWaterFrameContext(f)
  if (context instanceof Error) throw context
  const held = getHotWaterHoldingFrame({ ...context, animation: "idle", frame: 0 })
  if (held instanceof Error) throw held
  const grid = f.room.grid
  if (!grid) throw new Error("Missing measured room grid")
  for (const symbol of ["#", "F"]) {
    const room = { ...f.room, grid: { ...grid, rows: grid.rows.map((row, index) => (index === 2 ? row.slice(0, 2) + symbol + row.slice(3) : row)) } }
    expect(getHotWaterPotSpaceError({ ...context, ...held, room })?.message).toContain("room occupancy")
  }
  const outside = getPouringPotHeldPose({ profile: f.definition.profile, heading: -Math.PI / 2, tilt: 0, gripAt: [-1, 1, 1.2] })
  if (outside instanceof Error) throw outside
  expect(getHotWaterPotSpaceError({ ...context, ...held, pose: outside })?.message).toContain("room occupancy")
  expect(getHotWaterPotSpaceError({ ...context, ...held })).toBeNull()
})
