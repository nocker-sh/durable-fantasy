import { getSideStepTiming } from "#/world/town/get-side-step-timing"
import { getTimedSideStepState } from "#/world/town/get-timed-side-step-state"
import { groundFootwear } from "#/world/scene/figure/footing"
import { buildBody } from "#/world/scene/figure/body"
import { getSideStepPlan } from "#/world/town/get-side-step-plan"
import { getSideStepState } from "#/world/town/get-side-step-state"
import { getHeldBoxSideStepPose } from "#/world/scene/figure/get-held-box-side-step-pose"
import { getHeldBoxGaitPose } from "#/world/scene/figure/get-held-box-gait-pose"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FRAMES } from "#/world/scene/figure/animation"
import { solveHeldBoxPose } from "#/world/scene/figure/solve-held-box-pose"
import { ashReceivingSchema } from "#/scripts/lib/ash-receiving-schema"
import { getAshTransportError } from "#/scripts/lib/get-ash-transport-error"
import { getCarrierTranslationError } from "#/world/scene/figure/get-carrier-translation-error"
import { ashLidRestPlan } from "#/scripts/lib/ash-lid-rest-plan"
import { getCarrierRoomClearanceError } from "#/world/scene/figure/get-carrier-room-clearance-error"
import { hearthRoomSection } from "#/scripts/lib/hearth-room-section"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { storageRetrieval } from "#/world/town/storage-retrieval"
import { storageLidPlan } from "#/world/town/storage-lid-plan"
import { shelfLidHandle } from "#/world/town/shelf-lid-handle"
import { getNativeBoxGripCandidate } from "#/scripts/lib/get-native-box-grip-candidate"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { quarterTurnPoint } from "../../lib/engine/quarter-turn-point"
function fixture() {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h-m5-1.md", import.meta.url), "utf8"))
  const operation = room.furniture!.find((furniture) => furniture.hearth_maintenance)!.hearth_maintenance!,
    receiver = operation.ash_receiver!
  const rack = room.furniture!.find((furniture) => furniture.symbol === receiver.storage.furniture)!,
    scale = room.grid!.cell_m
  const shelf = shelfDimensions(rack.shelf, rack.rect[2] * scale, rack.rect[3] * scale),
    index = shelf.items!.findIndex((item) => item.id === receiver.storage.item),
    box = shelf.items![index]
  const withdrawal = storageRetrieval({
    x: (rack.rect[0] + rack.rect[2] / 2) * scale,
    z: (rack.rect[1] + rack.rect[3] / 2) * scale,
    width: rack.rect[2] * scale,
    depth: rack.rect[3] * scale,
    shelf: shelf,
    index: index,
  })
  const parts = storageLidPlan({
    withdrawn: withdrawal.to,
    wall: box.wall!,
    lid: box.lid!,
    handle: shelfLidHandle(shelf, box)!,
    lift: box.lidLift!,
    rest: [receiver.lid_rest.position_m[0], shelf.height, receiver.lid_rest.position_m[1]],
  }).body
  const building = readSetting(readFileSync(new URL("../../.docs/settings/buildings/building-h-m5.md", import.meta.url), "utf8"))
  const documents = new Map((building.rooms as string[]).map((id) => [id, readSetting(readFileSync(new URL(`../../.docs/settings/rooms/${id}.md`, import.meta.url), "utf8"))]))
  const hearth = room.furniture!.find((furniture) => furniture.hearth_maintenance)!
  const lid = ashLidRestPlan({ room: room, building: building, documents: documents, rack: rack, shelf: shelf, item: box, motion: withdrawal, rest: receiver.lid_rest })
  const section = lid.carrierSection
  const bodyObstacles = hearthRoomSection({ room: room, building: building, documents: documents, hearth: hearth }).bodyObstacles
  return {
    section,
    boxSection: lid.section,
    receiving: receiver.receiving,
    bodyObstacles,
    transport: receiver.receiving.transport_candidate,
    look: RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => `resident-${resident.name}` === operation.operator)],
    parts,
    height: receiver.door_approach.carry_bottom_m,
    candidate: receiver.receiving.grip_candidate,
    withdrawal,
  }
}
it("reaches both outside rim approaches with fixed native bone lengths", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  const sides: ReadonlyArray<"l" | "r"> = ["l", "r"]
  for (const side of sides) {
    const lengths = armGripLengths(pose.skeleton, side),
      shoulder = pose.skeleton.p[`upperarm_${side}`],
      elbow = pose.skeleton.p[`lowerarm_${side}`],
      wrist = pose.skeleton.p[`hand_${side}`]
    expect(Math.hypot(...elbow.map((value, index) => value - shoulder[index]))).toBeCloseTo(lengths.upper, 12)
    expect(Math.hypot(...wrist.map((value, index) => value - elbow[index]))).toBeCloseTo(lengths.forearm, 12)
    const grip = side === "l" ? pose.left.grip : pose.right.grip,
      across = quarterTurnPoint(grip[0], grip[2], pose.turn)
    expect(across[0] + setup.candidate.body_m[0]).toBeCloseTo(pose.grips[side][0], 12)
    expect(grip[1] + pose.rootY).toBeCloseTo(pose.grips[side][1], 12)
    expect(across[1] + setup.candidate.body_m[1]).toBeCloseTo(pose.grips[side][2], 12)
  }
  expect(setup.candidate.status).toBe("unverified")
})
it("rejects the original distant withdrawal position instead of stretching either arm", () => {
  const setup = fixture()
  const pose = getNativeBoxGripCandidate({ ...setup, candidate: { ...setup.candidate, body_m: [...setup.withdrawal.bodyEnd] } })
  expect(pose).toEqual(new Error("Left box grip is unreachable without stretching the arm"))
})

it("does not accept reachable hands when the box still overlaps the native core bounds", () => {
  const setup = fixture()
  expect(getNativeBoxGripCandidate({ ...setup, height: 0.78, candidate: { ...setup.candidate, body_m: [4.85, 6.25] } })).toEqual(new Error("Native carrier core clearance is unresolved"))
})

it("rejects the former inward elbow bends even though both hands still reach", () => {
  const setup = fixture()
  const pose = getNativeBoxGripCandidate({ ...setup, candidate: { ...setup.candidate, poles: { l: [-1, -1, 0], r: [1, -1, 0] } } })
  expect(pose).toEqual(new Error("Native carrier l arm or cuff clearance is unresolved"))
})

it("keeps the native standing grip pose clear of the actual room section", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  const error = getCarrierRoomClearanceError({ ...setup, ...pose, body: setup.candidate.body_m })
  expect(error).toBeNull()
})
it("rejects a ceiling or floor violation even when both hands reach the box", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  expect(getCarrierRoomClearanceError({ ...setup, ...pose, body: setup.candidate.body_m, section: { ...setup.section, ceiling: 1 } })).toEqual(new Error("Native carrier leaves its room section"))
  expect(getCarrierRoomClearanceError({ ...setup, ...pose, body: setup.candidate.body_m, rootY: pose.rootY - 0.1 })).toEqual(new Error("Native carrier leaves its room section"))
})
it("rejects room furniture at a hand even when the body centre remains free", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  const hand = pose.grips.l
  const obstacle = { x0: hand[0] - 0.01, x1: hand[0] + 0.01, z0: hand[2] - 0.01, z1: hand[2] + 0.01, bottom: hand[1] - 0.01, top: hand[1] + 0.01 }
  expect(getCarrierRoomClearanceError({ ...setup, ...pose, body: setup.candidate.body_m, section: { ...setup.section, obstacles: [...setup.section.obstacles, obstacle] } })).toEqual(
    new Error("Native carrier room clearance is unresolved"),
  )
})
it("retains the complete tabletop and four legs instead of removing the neighbouring table", () => {
  const setup = fixture()
  expect(setup.section.obstacles).toContainEqual({ x0: 4, z0: 6.5, x1: 5.5, z1: 7.5, bottom: 0.7, top: 0.74 })
  const legs = setup.section.obstacles.filter((part) => part.bottom === 0 && part.top === 0.7 && part.x0 >= 4 && part.x1 <= 5.5 && part.z0 >= 6.5 && part.z1 <= 7.5)
  expect(legs).toHaveLength(4)
  expect(setup.bodyObstacles).toContainEqual([4, 6.5, 5.5, 7.5])
})
it("refuses an invalid obstacle instead of treating its missing volume as clear space", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  const obstacle = { x0: 0, x1: NaN, z0: 0, z1: 1, bottom: 0, top: 1 }
  expect(getCarrierRoomClearanceError({ ...setup, ...pose, body: setup.candidate.body_m, section: { ...setup.section, obstacles: [obstacle] } })).toEqual(new Error("Invalid carrier room obstacle"))
})
it("sweeps the fixed native pose through every proposed corridor segment", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  const path = setup.transport.body_path_m
  expect(path[0]).toEqual(setup.candidate.body_m)
  for (const index of path.keys()) {
    if (index === 0) continue
    expect(getCarrierTranslationError({ ...setup, ...pose, body: path[index - 1], destination: path[index] })).toBeNull()
  }
  expect(setup.transport.status).toBe("unverified")
})
it("keeps the held box attached to the same body while crossing the full proposed corridor", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  const carrier = { look: setup.look, skeleton: pose.skeleton, rootY: pose.rootY, turn: pose.turn }
  expect(getAshTransportError({ ...setup, carrier, section: setup.boxSection, carrierSection: setup.section })).toBeNull()
})
it("rejects an obstacle crossed between clear native-pose endpoints", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  const a = setup.transport.body_path_m[0],
    b = setup.transport.body_path_m[1],
    x = pose.grips.l[0] + (b[0] - a[0]) / 2,
    hand = pose.grips.l
  const obstacle = { x0: x - 0.01, x1: x + 0.01, z0: hand[2] - 0.01, z1: hand[2] + 0.01, bottom: hand[1] - 0.01, top: hand[1] + 0.01 }
  const section = { ...setup.section, obstacles: [obstacle] }
  expect(getCarrierRoomClearanceError({ ...setup, ...pose, section, body: a })).toBeNull()
  expect(getCarrierRoomClearanceError({ ...setup, ...pose, section, body: b })).toBeNull()
  expect(getCarrierTranslationError({ ...setup, ...pose, section, body: a, destination: b })).toEqual(new Error("Native carrier room clearance is unresolved"))
})
it("rejects a held-box collision between endpoints without detaching it from the carrier", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  const a = setup.transport.body_path_m[0],
    b = setup.transport.body_path_m[1],
    bottom = setup.parts.find((part) => part.part === "bottom")!
  const x = (bottom.x0 + bottom.x1) / 2 + (b[0] - a[0]) / 2,
    z = (bottom.z0 + bottom.z1) / 2
  const obstacle = { x0: x - 0.01, x1: x + 0.01, z0: z - 0.01, z1: z + 0.01, bottom: bottom.y0 + setup.height, top: bottom.y1 + setup.height }
  const carrier = { look: setup.look, skeleton: pose.skeleton, rootY: pose.rootY, turn: pose.turn }
  expect(getAshTransportError({ ...setup, carrier, section: { ...setup.boxSection, obstacles: [obstacle] }, carrierSection: { ...setup.section, obstacles: [] } })).toEqual(
    new Error("Held ash box movement intersects an obstacle"),
  )
})
it("rejects a detached start, wrong staging endpoint, empty segment and claimed walking adoption", () => {
  const setup = fixture(),
    pose = getNativeBoxGripCandidate(setup)
  if (pose instanceof Error) throw pose
  const carrier = { look: setup.look, skeleton: pose.skeleton, rootY: pose.rootY, turn: pose.turn },
    path = setup.transport.body_path_m
  for (const body_path_m of Array<Array<[number, number]>>([[4.6, 6.03], ...path.slice(1)], [...path.slice(0, -1), [4, 2]])) {
    expect(
      getAshTransportError({
        ...setup,
        carrier,
        receiving: { ...setup.receiving, transport_candidate: { ...setup.transport, body_path_m } },
        section: setup.boxSection,
        carrierSection: setup.section,
      }),
    ).toEqual(new Error("Native box transport does not join its grip candidate to staging"))
  }
  expect(
    getAshTransportError({
      ...setup,
      carrier,
      receiving: { ...setup.receiving, transport_candidate: { ...setup.transport, body_path_m: [path[0], ...path] } },
      section: setup.boxSection,
      carrierSection: setup.section,
    }),
  ).toEqual(new Error("Native box transport has an empty segment"))
  expect(ashReceivingSchema.safeParse({ ...setup.receiving, transport_candidate: { ...setup.transport, model: "walking", status: "verified" } }).success).toBe(false)
})
it("inspects the existing carry gait without stretching native bones", () => {
  const setup = fixture()
  const failures = Array.from({ length: FRAMES.carry }, (_, frame) => {
    const pose = solveHeldBoxPose({ ...setup, skeleton: skelFor(setup.look, "carry", frame) })
    if (pose instanceof Error) return { frame, message: pose.message, cause: pose.cause }
    for (const side of Array<"l" | "r">("l", "r")) {
      const lengths = armGripLengths(pose.skeleton, side),
        shoulder = pose.skeleton.p[`upperarm_${side}`],
        elbow = pose.skeleton.p[`lowerarm_${side}`],
        wrist = pose.skeleton.p[`hand_${side}`]
      expect(Math.hypot(...elbow.map((value, index) => value - shoulder[index]))).toBeCloseTo(lengths.upper, 12)
      expect(Math.hypot(...wrist.map((value, index) => value - elbow[index]))).toBeCloseTo(lengths.forearm, 12)
      expect(pose.skeleton.p[`foot_${side}`]).toEqual(skelFor(setup.look, "carry", frame).p[`foot_${side}`])
    }
    return null
  }).filter((failure) => failure !== null)
  expect(failures).toEqual([])
})
it("keeps each rendered carry phase clear over the entire candidate corridor", () => {
  const setup = fixture(),
    path = setup.transport.body_path_m
  for (const frame of Array.from({ length: FRAMES.carry }).keys()) {
    const pose = solveHeldBoxPose({ ...setup, skeleton: skelFor(setup.look, "carry", frame) })
    if (pose instanceof Error) throw pose
    for (const index of path.keys()) {
      if (index === 0) continue
      const error = getCarrierTranslationError({ ...setup, ...pose, body: path[index - 1], destination: path[index] })
      if (error) throw new Error(`Carry frame ${frame}, corridor ${index}: ${error.message}`, { cause: error.cause })
    }
  }
})
it("still rejects the original low box when the carry gait moves the legs into its bounds", () => {
  const setup = fixture()
  expect(solveHeldBoxPose({ ...setup, height: 0.82, candidate: { ...setup.candidate, body_m: [4.85, 6.25] }, skeleton: skelFor(setup.look, "carry", 0) })).toEqual(
    new Error("Native carrier core clearance is unresolved"),
  )
})
it("retains the native legs and fixed arm lengths while reversing all held gait poses", () => {
  const setup = fixture(),
    expected = [0, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
  for (const phase of expected.keys()) {
    const pose = getHeldBoxGaitPose({ ...setup, phase, playback: "reverse" })
    if (pose instanceof Error) throw pose
    const native = skelFor(setup.look, "carry", expected[phase])
    for (const side of Array<"l" | "r">("l", "r")) {
      expect(pose.skeleton.p[`foot_${side}`]).toEqual(native.p[`foot_${side}`])
      expect(pose.skeleton.p[`calf_${side}`]).toEqual(native.p[`calf_${side}`])
      const lengths = armGripLengths(pose.skeleton, side),
        shoulder = pose.skeleton.p[`upperarm_${side}`],
        elbow = pose.skeleton.p[`lowerarm_${side}`],
        wrist = pose.skeleton.p[`hand_${side}`]
      expect(Math.hypot(...elbow.map((value, index) => value - shoulder[index]))).toBeCloseTo(lengths.upper, 12)
      expect(Math.hypot(...wrist.map((value, index) => value - elbow[index]))).toBeCloseTo(lengths.forearm, 12)
      const grip = side === "l" ? pose.left.grip : pose.right.grip,
        across = quarterTurnPoint(grip[0], grip[2], pose.turn)
      expect(across[0] + setup.candidate.body_m[0]).toBeCloseTo(pose.grips[side][0], 12)
      expect(grip[1] + pose.rootY).toBeCloseTo(pose.grips[side][1], 12)
      expect(across[1] + setup.candidate.body_m[1]).toBeCloseTo(pose.grips[side][2], 12)
    }
  }
})
it("keeps the box reachable during a small left side-step candidate", () => {
  const setup = fixture()
  for (const phase of [0, 0.25, 0.5, 0.75, 1]) {
    const pose = getHeldBoxSideStepPose({ ...setup, phase, stride: 0.12, lift: 0.05, pelvisDrop: 0.02, direction: "left" })
    if (pose instanceof Error) throw pose
    expect(getCarrierRoomClearanceError({ ...setup, ...pose, body: setup.candidate.body_m })).toBeNull()
  }
})
it("arrives at every authored lateral endpoint with complete native foot cycles", () => {
  const setup = fixture(),
    review = setup.receiving.transport_candidate.gait_review,
    standing = getNativeBoxGripCandidate(setup)
  if (standing instanceof Error) throw standing
  if (!review.side_step) throw new Error("Missing side-step dimensions")
  for (const index of review.step_plan.keys()) {
    if (review.step_plan[index].animation !== "side_step") continue
    const plan = getSideStepPlan({ from: setup.transport.body_path_m[index], to: setup.transport.body_path_m[index + 1], turn: standing.turn, maxStride: review.side_step.stride_m })
    if (plan instanceof Error) throw plan
    for (const cycle of Array.from({ length: plan.cycles + 1 }).keys()) {
      const state = getSideStepState({ plan, progress: cycle / plan.cycles })
      if (state instanceof Error) throw state
      const pose = getHeldBoxSideStepPose({ ...setup, phase: state.phase, stride: state.stride, direction: state.direction, lift: review.side_step.lift_m, pelvisDrop: review.side_step.pelvis_drop_m })
      if (pose instanceof Error) throw pose
      expect(getCarrierRoomClearanceError({ ...setup, ...pose, body: state.body })).toBeNull()
      const feet = groundFootwear(buildBody(setup.look, pose.skeleton, null).footwear)
      for (const foot of feet.feet) expect(foot.clearance).toBeCloseTo(0, 12)
    }
  }
})
it("keeps a planted native shoe fixed while the authored timing accelerates and stops", () => {
  const setup = fixture(),
    dimensions = setup.receiving.transport_candidate.gait_review.side_step,
    standing = getNativeBoxGripCandidate(setup)
  if (!dimensions || standing instanceof Error) throw new Error("Missing authored timing")
  const plan = getSideStepPlan({ from: setup.transport.body_path_m[1], to: setup.transport.body_path_m[2], turn: standing.turn, maxStride: dimensions.stride_m })
  if (plan instanceof Error) throw plan
  const timing = getSideStepTiming({ plan, minCycleMs: dimensions.timing.min_cycle_s * 1000, maxSpeed: dimensions.timing.max_speed_m_s, maxAcceleration: dimensions.timing.max_acceleration_m_s2 })
  if (timing instanceof Error) throw timing
  const base = groundFootwear(buildBody(setup.look, skelFor(setup.look, "idle", 0), null).footwear)
  for (const fraction of Array.from({ length: 101 }, (_, index) => index / 100)) {
    const state = getTimedSideStepState({ timing, elapsedMs: timing.durationMs * fraction })
    if (state instanceof Error) throw state
    const pose = getHeldBoxSideStepPose({ ...setup, phase: state.phase, stride: state.stride, direction: state.direction, lift: dimensions.lift_m, pelvisDrop: dimensions.pelvis_drop_m })
    if (pose instanceof Error) throw pose
    const side = state.phase <= 0.5 ? "r" : "l",
      landed = state.phase <= 0.5 ? state.cycle : state.cycle + 1
    const foot = groundFootwear(buildBody(setup.look, pose.skeleton, null).footwear).feet.find((entry) => entry.side === side)!
    const original = base.feet.find((entry) => entry.side === side)!,
      local = quarterTurnPoint(foot.lowest[0], foot.lowest[2], pose.turn),
      anchor = quarterTurnPoint(original.lowest[0] + landed * plan.stride, original.lowest[2], pose.turn)
    expect(state.body[0] + local[0]).toBeCloseTo(plan.from[0] + anchor[0], 12)
    expect(state.body[1] + local[1]).toBeCloseTo(plan.from[1] + anchor[1], 12)
    expect(foot.clearance).toBeCloseTo(0, 12)
    expect(getCarrierRoomClearanceError({ ...setup, ...pose, body: state.body })).toBeNull()
  }
})
