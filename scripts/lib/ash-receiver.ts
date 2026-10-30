import { getAshGaitError } from "#/scripts/lib/get-ash-gait-error"
import { getAshTransportError } from "#/scripts/lib/get-ash-transport-error"
import { getCarrierRoomClearanceError } from "#/world/scene/figure/get-carrier-room-clearance-error"
import { getNativeBoxGripCandidate } from "#/scripts/lib/get-native-box-grip-candidate"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { getAshApproachError } from "#/scripts/lib/get-ash-approach-error"
import { getAshReceivingParts } from "#/scripts/lib/get-ash-receiving-parts"
import { ashLidRestPlan } from "#/scripts/lib/ash-lid-rest-plan"
import { storageBoxInterior } from "#/world/town/storage-box-interior"
import { storageRetrieval } from "#/world/town/storage-retrieval"
import { certifyStorageCarry } from "#/world/town/storage-carry"
import { roomCarryObstacles } from "#/scripts/lib/room-carry-obstacles"
import { certifyStorageTranslation } from "#/world/town/certify-storage-translation"
import { storageLidState } from "#/world/town/storage-lid-state"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { MIN_PASSAGE_WIDTH_M, MIN_STANDING_HEADROOM_M } from "#/scripts/lib/spatial-rules"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const EPS = 1e-9
/** Storage, volume and the indoor door approach only; receiving ash and outdoor disposal remain unverified. */
export function auditAshReceivers(room: SettingDocument, building?: SettingDocument, documents?: ReadonlyMap<string, SettingDocument>): string[] {
  if (!room.grid) return []
  const errors: string[] = [],
    k = room.grid.cell_m
  for (const hearth of room.furniture ?? []) {
    const op = hearth.hearth_maintenance,
      receiver = op?.ash_receiver
    if (!op) continue
    if (!receiver) {
      if (room.design_gate === "通過") errors.push(`${hearth.symbol}: Ash receiver is missing`)
      continue
    }
    try {
      if (receiver.status !== "unverified" || receiver.cold_only !== true || room.design_gate === "通過") throw new Error("Ash receiver's unverified operation must retain the design gate")
      const rack = room.furniture?.find((f) => f.symbol === receiver.storage.furniture)
      if (!rack || rack.role !== "ash_storage" || !rack.maintainers?.includes(op.operator)) throw new Error("Ash receiver needs dedicated storage and its operator")
      const xState = rack.rect.map((v) => v * k),
        x = xState[0],
        z = xState[1],
        w = xState[2],
        d = xState[3],
        shelf = shelfDimensions(rack.shelf, w, d),
        index = shelf.items?.findIndex((i) => i.id === receiver.storage.item) ?? -1,
        item = shelf.items?.[index]
      if (!item || item.kind !== "box" || item.boxMaterial !== "iron" || item.lidLift === undefined) throw new Error("Ash receiver must be an explicitly lidded iron box")
      if (!item.lidHandle) throw new Error("Ash receiver lid needs an explicit grip handle")
      const interior = storageBoxInterior(item)
      if (!Number.isFinite(receiver.capacity_l) || receiver.capacity_l <= 0 || receiver.capacity_l > interior.volume * 1000 + EPS) throw new Error("Ash receiver capacity exceeds its usable cavity")
      const motion = storageRetrieval({ x: x + w / 2, z: z + d / 2, width: w, depth: d, shelf: shelf, index: index }),
        body = motion.bodyEnd,
        t = motion.to,
        path = receiver.door_approach,
        relative = [t.x0 - body[0], t.z0 - body[1], t.x1 - body[0], t.z1 - body[1]] as const,
        first = path.poses[0],
        last = path.poses.at(-1),
        connection = ((room.connections ?? []) as { target: string; door?: [number, number]; width_cells?: number }[]).find((c) => c.target === path.target)
      if (!first || first.turn !== 0 || Math.hypot(first.body_m[0] - body[0], first.body_m[1] - body[1]) > EPS) throw new Error("Ash receiver path does not join its storage withdrawal")
      if (!Number.isFinite(path.body_radius_m) || path.body_radius_m < MIN_PASSAGE_WIDTH_M / 2) throw new Error("Ash receiver omits the carrier design width")
      if (!connection?.door || !path.target.startsWith("map-") || !last) throw new Error("Ash receiver needs its exterior doorway")
      const dxState = connection.door,
        dx = dxState[0],
        dz = dxState[1],
        width = room.grid.rows[0].length,
        depth = room.grid.rows.length,
        n = connection.width_cells ?? 1,
        r = path.body_radius_m
      const expected =
        dz === 0 ? [(dx + n / 2) * k, k + r] : dz === depth - 1 ? [(dx + n / 2) * k, dz * k - r] : dx === 0 ? [k + r, (dz + n / 2) * k] : dx === width - 1 ? [dx * k - r, (dz + n / 2) * k] : undefined
      if (!expected || Math.hypot(last.body_m[0] - expected[0], last.body_m[1] - expected[1]) > EPS) throw new Error("Ash receiver path does not reach the indoor door approach")
      const level = (building?.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m: number }[] | undefined)?.find((l) => l.floor === room.floor),
        ceiling = level ? level.ceiling_elevation_m - level.elevation_m : NaN
      if (!Number.isFinite(path.carry_bottom_m) || path.carry_bottom_m <= 0 || !Number.isFinite(ceiling) || ceiling < MIN_STANDING_HEADROOM_M || path.carry_bottom_m + item.height > ceiling + EPS)
        throw new Error("Ash receiver carry lacks vertical clearance")
      if (!building || !documents) throw new Error("Ash lid rest needs its building documents")
      const planSource = ashLidRestPlan({ room: room, building: building, documents: documents, rack: rack, shelf: shelf, item: item, motion: motion, rest: receiver.lid_rest }),
        plan = planSource.plan,
        section = planSource.section,
        carrierSection = planSource.carrierSection
      const receivingParts = getAshReceivingParts({ box: item, front: shelf.front, receiving: receiver.receiving })
      if (receivingParts instanceof Error) throw receivingParts
      const receivingError = certifyStorageTranslation({ parts: receivingParts, from: [0, 0, 0], to: [0, 0, 0], section, name: "Ash receiver" })
      if (receivingError) throw receivingError
      const liftError = certifyStorageTranslation({ parts: storageLidState(plan, 0), from: [0, 0, 0], to: [0, path.carry_bottom_m, 0], section, name: "Storage box" })
      if (liftError) throw liftError
      const carryTop = Math.max(MIN_STANDING_HEADROOM_M, path.carry_bottom_m + item.height),
        carryObstacles = [...roomCarryObstacles(room), ...section.obstacles.filter((o) => o.bottom < carryTop - EPS && o.top > EPS).map((o) => [o.x0, o.z0, o.x1, o.z1] as const)]
      certifyStorageCarry({ relative: relative, radius: r, poses: path.poses, width: width * k, depth: depth * k, obstacles: carryObstacles, name: "ash receiver" })
      const openParts = storageLidState(plan, plan.offsets.length - 1)
      const parkedLid = openParts
        .filter((part) => part.part === "lid" || part.part === "lid-handle")
        .map((part) => ({ x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 }))
      const operator = RESIDENTS.findIndex((resident) => `resident-${resident.name}` === op.operator)
      if (operator < 0) throw new Error("Ash box grip has no operator")
      const gripCandidate = getNativeBoxGripCandidate({ look: RESIDENT_LOOKS[operator], parts: plan.body, height: path.carry_bottom_m, candidate: receiver.receiving.grip_candidate })
      if (gripCandidate instanceof Error) throw gripCandidate
      const roomError = getCarrierRoomClearanceError({
        look: RESIDENT_LOOKS[operator],
        skeleton: gripCandidate.skeleton,
        rootY: gripCandidate.rootY,
        turn: gripCandidate.turn,
        body: receiver.receiving.grip_candidate.body_m,
        section: { ...carrierSection, obstacles: [...carrierSection.obstacles, ...parkedLid] },
      })
      if (roomError) throw roomError
      const transportError = getAshTransportError({
        carrier: { look: RESIDENT_LOOKS[operator], skeleton: gripCandidate.skeleton, rootY: gripCandidate.rootY, turn: gripCandidate.turn },
        parts: plan.body,
        height: path.carry_bottom_m,
        receiving: receiver.receiving,
        section: { ...section, obstacles: [...section.obstacles, ...parkedLid] },
        carrierSection: { ...carrierSection, obstacles: [...carrierSection.obstacles, ...parkedLid] },
      })
      if (transportError) throw transportError
      const approachError = getAshApproachError({
        parts: plan.body,
        bodyStart: body,
        receiving: receiver.receiving,
        radius: r,
        height: path.carry_bottom_m,
        section: { ...section, obstacles: [...section.obstacles, ...parkedLid] },
      })
      if (approachError) throw approachError
      const gaitError = getAshGaitError({
        look: RESIDENT_LOOKS[operator],
        parts: plan.body,
        height: path.carry_bottom_m,
        receiving: receiver.receiving,
        section: { ...section, obstacles: [...section.obstacles, ...parkedLid] },
        carrierSection: { ...carrierSection, obstacles: [...carrierSection.obstacles, ...parkedLid] },
      })
      if (gaitError) throw gaitError
    } catch (error) {
      errors.push(`${hearth.symbol}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return errors
}
