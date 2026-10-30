import { hearthRoomSection } from "./hearth-room-section"
import { hearthSpatialStrokes } from "#/world/town/hearth-spatial-strokes"
import { cuboidTranslationHits } from "../../lib/engine/cuboid-translation-hits"
import { translatedCuboid } from "../../lib/engine/translated-cuboid"
import { quarterTurnRect } from "../../lib/engine/quarter-turn-rect"
import { rectangleTranslationBounds } from "../../lib/engine/rectangle-translation-bounds"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { subtractRectangles } from "../../lib/engine/rectangle-subtraction"
import { handoffEnvelope } from "#/world/town/handoff-envelope"
import { handoffRotationEnvelope } from "#/world/town/handoff-rotation-envelope"
import { samePoint3 } from "#/world/town/same-point3"
import type { HandoffPose } from "#/world/town/hearth-handoff"
import { storageRetrieval } from "../../world/town/storage-retrieval"
import { shelfDimensions } from "./shelf-dimensions"
import { hearthDimensions } from "./hearth-dimensions"
import { MAX_HAND_REACH_M } from "./spatial-rules"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const EPS = 1e-9
const near = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]) < EPS
export function auditHearthHandoff(room: SettingDocument, building: SettingDocument | undefined, documents: ReadonlyMap<string, SettingDocument>): string[] {
  if (!room.grid) return []
  const errors: string[] = [],
    k = room.grid.cell_m
  for (const f of room.furniture ?? []) {
    const op = f.hearth_maintenance,
      h = op?.handoff
    if (!op || !h) continue
    let step = 0
    try {
      const level = (building?.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m: number }[] | undefined)?.find((l) => l.floor === room.floor),
        ceiling = level ? level.ceiling_elevation_m - level.elevation_m : NaN
      if (!building || !Number.isFinite(ceiling)) throw new Error("Handoff has no ceiling section")
      const storage = op.tool.storage,
        rack = room.furniture?.find((p) => p.symbol === storage?.furniture),
        last = op.carry?.poses.at(-1)
      if (!rack || !storage || !last || !f.hearth_front || !near(last.body_m, h.staging_body_m)) throw new Error("Handoff has no matching carry endpoint")
      const rxState = rack.rect.map((n) => n * k),
        rx = rxState[0],
        rz = rxState[1],
        rw = rxState[2],
        rd = rxState[3],
        shelf = shelfDimensions(rack.shelf, rw, rd),
        index = shelf.items?.findIndex((item) => item.id === storage.item) ?? -1
      const motion = storageRetrieval({ x: rx + rw / 2, z: rz + rd / 2, width: rw, depth: rd, shelf: shelf, index: index }),
        item = shelf.items![index],
        a = h.grip_from_blade_m
      if (!item.tool || a <= item.tool.bladeLength || a >= op.tool.length_m) throw new Error("Handoff grip is not on the tool handle")
      const t = motion.to,
        relative = quarterTurnRect({ bounds: { x0: t.x0 - motion.bodyEnd[0], z0: t.z0 - motion.bodyEnd[1], x1: t.x1 - motion.bodyEnd[0], z1: t.z1 - motion.bodyEnd[1] }, turn: last.turn })
      const centre = [(relative.x0 + relative.x1) / 2, (relative.z0 + relative.z1) / 2]
      const carried = { x0: relative.x0 - centre[0], z0: relative.z0 - centre[1], x1: relative.x1 - centre[0], z1: relative.z1 - centre[1] }
      const initial: HandoffPose = { body_m: last.body_m, grip_m: [last.body_m[0] + centre[0], t.y0 + a, last.body_m[1] + centre[1]], orientation: "carry_vertical" }
      const poses = [initial, ...h.steps],
        spec = hearthDimensions(f.hearth),
        xState = f.rect.map((n) => n * k),
        x = xState[0],
        z = xState[1],
        w = xState[2],
        d = xState[3],
        bounds = { x0: x, z0: z, x1: x + w, z1: z + d }
      const final = poses.at(-1)!
      if (!near(final.body_m, op.body_m) || !near([final.grip_m[0], final.grip_m[2]], op.grip_m) || Math.abs(final.grip_m[1] - op.grip_height_m) > EPS || final.orientation !== "work_sloped")
        throw new Error("Handoff does not join the working grip")
      const working = hearthSpatialStrokes({
        bounds: bounds,
        front: f.hearth_front,
        spec: spec,
        grip: op.grip_m,
        height: op.grip_height_m,
        width: op.tool.blade_width_m,
        thickness: op.tool.blade_thickness_m,
        length: op.tool.length_m,
      })
      if (Math.abs(a - working.tilt.gripFromBlade) > EPS) throw new Error("Handoff grip length does not match its working tilt")
      const obstaclesSource = hearthRoomSection({ room: room, building: building, documents: documents, hearth: f }),
        obstacles = obstaclesSource.obstacles,
        bodyObstacles = obstaclesSource.bodyObstacles
      const areas = [f.use_space?.[op.space_index]?.rect, h.stage_area].map((r) => {
        if (!r) throw new Error("Handoff has no operating space")
        return { x0: r[0] * k, z0: r[1] * k, x1: (r[0] + r[2]) * k, z1: (r[1] + r[3]) * k }
      })
      const sxState = h.stage_area,
        sx = sxState[0],
        sz = sxState[1],
        sw = sxState[2],
        sd = sxState[3]
      for (let z = sz; z < sz + sd; z++) for (let x = sx; x < sx + sw; x++) if (room.grid.rows[z]?.[x] !== ".") throw new Error("Handoff staging area is not clear floor")
      for (let i = 1; i < poses.length; i++) {
        step = i
        const from = poses[i - 1],
          to = poses[i],
          rotating = from.orientation !== to.orientation
        if (![...from.grip_m, ...to.grip_m, ...from.body_m, ...to.body_m].every(Number.isFinite)) throw new Error("Invalid handoff pose")
        if (rotating && (!samePoint3(from.grip_m, to.grip_m) || !near(from.body_m, to.body_m))) throw new Error("Handoff must rotate at a fixed grip and body position")
        const envelope = rotating
          ? handoffRotationEnvelope({
              front: f.hearth_front,
              width: op.tool.blade_width_m,
              thickness: op.tool.blade_thickness_m,
              length: op.tool.length_m,
              gripFromBlade: a,
              from: from.orientation,
              to: to.orientation,
              tilt: working.tilt.angle,
            })
          : handoffEnvelope({
              front: f.hearth_front,
              width: op.tool.blade_width_m,
              thickness: op.tool.blade_thickness_m,
              length: op.tool.length_m,
              gripFromBlade: a,
              orientation: from.orientation,
              carried: carried,
              tilt: working.tilt.angle,
            })
        for (const p of [from, to]) {
          if (Math.hypot(p.grip_m[0] - p.body_m[0], p.grip_m[2] - p.body_m[1]) > MAX_HAND_REACH_M + EPS) throw new Error("Handoff grip is beyond planar hand reach")
          const box = translatedCuboid(envelope, p.grip_m)
          if (box.bottom < -EPS || box.top > ceiling + EPS || box.x0 < -EPS || box.z0 < -EPS || box.x1 > room.grid.rows[0].length * k + EPS || box.z1 > room.grid.rows.length * k + EPS)
            throw new Error("Handoff tool leaves its room section")
        }
        const bodySweep = rectangleTranslationBounds([-op.body_radius_m, -op.body_radius_m, op.body_radius_m, op.body_radius_m], from.body_m, to.body_m)
        if (bodySweep[0] < -EPS || bodySweep[1] < -EPS || bodySweep[2] > room.grid.rows[0].length * k + EPS || bodySweep[3] > room.grid.rows.length * k + EPS)
          throw new Error("Handoff body leaves its room")
        if (subtractRectangles({ x0: bodySweep[0], z0: bodySweep[1], x1: bodySweep[2], z1: bodySweep[3] }, areas).length) throw new Error("Handoff body leaves its operating spaces")
        const relativeBody = (p: HandoffPose) => [p.body_m[0] - p.grip_m[0], p.body_m[1] - p.grip_m[2]]
        if (segmentRectDistance([envelope.x0, envelope.z0, envelope.x1, envelope.z1], relativeBody(from), relativeBody(to)) < op.body_radius_m - EPS)
          throw new Error("Handoff tool crosses its carrier")
        if (bodyObstacles.some((r) => segmentRectDistance(r, from.body_m, to.body_m) < op.body_radius_m - EPS)) throw new Error("Handoff body crosses furniture")
        if (obstacles.some((o) => cuboidTranslationHits({ relative: envelope, from: from.grip_m, to: to.grip_m, obstacle: o, tolerance: EPS })))
          throw new Error("Handoff tool crosses masonry, a wall or furniture")
      }
    } catch (error) {
      errors.push(`${f.symbol}: ${step ? `step ${step}: ` : ""}${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return errors
}
