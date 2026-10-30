import { getAshReceivingParts } from "#/scripts/lib/get-ash-receiving-parts"
import { certifyForearmBody } from "#/world/scene/figure/forearm-body-clearance"
import { certifyWorkingArmTool } from "#/world/scene/figure/working-arm-tool-clearance"
import { workingToolGeometry } from "#/world/town/working-tool-geometry"
import { workingToolGripProfile } from "#/world/town/working-tool-grip-profile"
import { certifyToolFixedBody } from "#/world/scene/figure/tool-fixed-body-clearance"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { certifyWorkStrokeRoom } from "#/world/scene/figure/work-stroke-clearance"
import { nativeWorkStrokeEndpoints } from "#/world/scene/figure/work-stroke"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import { type Point3 } from "#/lib/engine/cuboid-motion-types"
import { hearthSpatialStrokes } from "#/world/town/hearth-spatial-strokes"
import { tiltedToolEnvelope } from "#/world/town/tilted-tool-envelope"
import { hearthDimensions } from "#/scripts/lib/hearth-dimensions"
import { hearthRoomSection } from "#/scripts/lib/hearth-room-section"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import { quarterTurnPoint } from "#/lib/engine/quarter-turn-point"
import { quarterTurnRect } from "#/lib/engine/quarter-turn-rect"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { nativeWorkPose } from "#/world/scene/figure/native-work-pose"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const EPS = 1e-9
/** Conservative native primitive bounds can prove separation; overlaps remain unresolved, never silently accepted. */
export function auditNativeWorkPose(room: SettingDocument, building: SettingDocument | undefined, documents: ReadonlyMap<string, SettingDocument>): string[] {
  if (!room.grid) return []
  const errors: string[] = []
  for (const f of room.furniture ?? []) {
    const op = f.hearth_maintenance,
      candidate = op?.work_pose_candidate
    if (!op || !candidate) continue
    try {
      if (!building || !f.hearth_front) throw new Error("Native work pose has no building or hearth front")
      const person = RESIDENTS.findIndex((r) => `resident-${r.name}` === op.operator)
      if (person < 0) throw new Error("Native work pose has no operator")
      const k = room.grid.cell_m,
        xState = f.rect.map((v) => v * k),
        x = xState[0],
        z = xState[1],
        w = xState[2],
        d = xState[3],
        working = hearthSpatialStrokes({
          bounds: { x0: x, z0: z, x1: x + w, z1: z + d },
          front: f.hearth_front,
          spec: hearthDimensions(f.hearth),
          grip: op.grip_m,
          height: op.grip_height_m,
          width: op.tool.blade_width_m,
          thickness: op.tool.blade_thickness_m,
          length: op.tool.length_m,
        })
      const storage = op.tool.storage,
        rack = room.furniture?.find((f) => f.symbol === storage?.furniture)
      if (!rack || !storage) throw new Error("Working tool has no storage geometry")
      const shelf = shelfDimensions(rack.shelf, rack.rect[2] * k, rack.rect[3] * k),
        item = shelf.items?.find((item) => item.id === storage.item)
      if (!item?.tool) throw new Error("Working tool has no blade and handle geometry")
      const geometry = workingToolGeometry(f.hearth_front, working.tilt.angle, {
        width: item.width,
        thickness: item.depth,
        length: item.height,
        gripFromBlade: working.tilt.gripFromBlade,
        ...item.tool,
      })
      const profile = workingToolGripProfile(geometry)
      const central = nativeWorkPose({ look: RESIDENT_LOOKS[person], pose: candidate, target: [op.grip_m[0], op.grip_height_m, op.grip_m[1]], gripAxis: working.axis, profile: profile })
      if (candidate.stroke_motion === "fixed_support" && candidate.stroke_clearance !== "unverified")
        throw new Error("Fixed-support working stroke must retain unresolved hand and self-contact checks")
      const poses =
        candidate.stroke_motion === "fixed_support"
          ? [
              central,
              ...nativeWorkStrokeEndpoints({
                look: RESIDENT_LOOKS[person],
                candidate: candidate,
                grips: [[...working.strokes[0].grip], [...working.strokes[1].grip]],
                axis: working.axis,
                profile: profile,
              }),
            ]
          : [central]
      const section = hearthRoomSection({ room: room, building: building, documents: documents, hearth: f }),
        ceilingSource = section,
        ceiling = ceilingSource.ceiling,
        bounds = ceilingSource.bounds,
        masonry = ceilingSource.masonry,
        surrounding = ceilingSource.surrounding
      if (op.ash_receiver) {
        const receiverRack = room.furniture?.find((rack) => rack.symbol === op.ash_receiver?.storage.furniture)
        if (!receiverRack) throw new Error("Ash receiving placement has no storage")
        const receiverShelf = shelfDimensions(receiverRack.shelf, receiverRack.rect[2] * k, receiverRack.rect[3] * k)
        const receiverBox = receiverShelf.items?.find((box) => box.id === op.ash_receiver?.storage.item)
        if (!receiverBox) throw new Error("Ash receiving placement has no box")
        const receivingParts = getAshReceivingParts({ box: receiverBox, front: receiverShelf.front, receiving: op.ash_receiver.receiving })
        if (receivingParts instanceof Error) throw receivingParts
        const receivingObstacles = receivingParts.map((part) => ({ x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 }))
        surrounding.push(...receivingObstacles)
        section.obstacles.push(...receivingObstacles)
      }
      for (const pose of poses)
        for (const p of pose.body.prims) {
          const b = primitiveBounds(p),
            r = quarterTurnRect({ bounds: { x0: b.min[0], z0: b.min[2], x1: b.max[0], z1: b.max[2] }, turn: pose.turn, origin: [candidate.body_m[0], candidate.body_m[1]] }),
            bottom = b.min[1] + pose.rootY,
            top = b.max[1] + pose.rootY
          if (bottom < -EPS || top > ceiling + EPS || r.x0 < bounds.x0 - EPS || r.x1 > bounds.x1 + EPS || r.z0 < bounds.z0 - EPS || r.z1 > bounds.z1 + EPS)
            throw new Error(`Native body section is unresolved at primitive ${p.id}`)
          // The renderer's enclosing sphere gives a second independent conservative separation bound.
          const cap = p.kind === "cap" || p.kind === "cone",
            c = cap ? p.a.map((v, i) => (v + p.b[i]) / 2) : p.a,
            radius = cap ? Math.hypot(...p.a.map((v, i) => v - p.b[i])) / 2 + Math.max(p.r, p.r2) : p.kind === "sph" ? p.r * Math.max(p.sx ?? 1, p.sy ?? 1, p.sz ?? 1) : p.r
          const cxState = quarterTurnPoint(c[0], c[2], pose.turn),
            cx = cxState[0],
            cz = cxState[1],
            centre: Point3 = [cx + candidate.body_m[0], c[1] + pose.rootY, cz + candidate.body_m[1]],
            bodyBounds = { ...r, bottom, top }
          for (const entry of [
            ["masonry", masonry],
            ["surrounding", surrounding],
          ] as const) {
            const label = entry[0]
            const obstacles = entry[1]
            for (const stone of obstacles) {
              if (segmentCuboidDistance(stone, centre, centre) >= radius - EPS) continue
              if (cuboidTranslationHits({ relative: bodyBounds, from: [0, 0, 0], to: [0, 0, 0], obstacle: stone, tolerance: EPS }))
                throw new Error(`Native body ${label} clearance is unresolved at primitive ${p.id}`)
            }
          }
        }
      if (candidate.stroke_motion === "fixed_support")
        certifyWorkStrokeRoom({
          look: RESIDENT_LOOKS[person],
          candidate: candidate,
          grips: [[...working.strokes[0].grip], [...working.strokes[1].grip]],
          axis: working.axis,
          tool: tiltedToolEnvelope({
            front: f.hearth_front,
            width: op.tool.blade_width_m,
            thickness: op.tool.blade_thickness_m,
            length: op.tool.length_m,
            gripFromBlade: working.tilt.gripFromBlade,
            tilt: working.tilt.angle,
          }),
          room: section,
        })
      if (candidate.stroke_motion === "fixed_support") {
        certifyToolFixedBody({ base: central, candidate: candidate, grips: [[...working.strokes[0].grip], [...working.strokes[1].grip]], tool: geometry })
        certifyWorkingArmTool({ look: RESIDENT_LOOKS[person], candidate: candidate, grips: [[...working.strokes[0].grip], [...working.strokes[1].grip]], axis: working.axis, tool: geometry })
        certifyForearmBody({ look: RESIDENT_LOOKS[person], candidate: candidate, grips: [[...working.strokes[0].grip], [...working.strokes[1].grip]], axis: working.axis })
      }
    } catch (error) {
      errors.push(`${f.symbol}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return errors
}
