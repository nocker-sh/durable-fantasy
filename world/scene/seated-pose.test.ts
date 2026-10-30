import { workTableSections } from "../town/work-table"
import { expect, it } from "vitest"
import hall from "../town/floorplan/authored/h-m5"
import { RESIDENTS, RESIDENT_LOOKS } from "../town/residents"
import { INTERIORS } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { FRAMES } from "#/world/scene/figure/animation"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { buildBody } from "./figure/body"
import { seatedAnchor } from "#/world/scene/seated-anchor"
import { seatedSupport } from "#/world/scene/seated-support"

const figureScale = ROOM_SCALE
it("supports both shoes of every pupil throughout the seated animation on the assigned foot board", () => {
  const room = INTERIORS.find((room) => room.id === "phanthiet-in-h-m5")!
  const students = hall.activitySpots.filter((spot) => spot.role === "student")
  expect(students).toHaveLength(8)
  for (const student of students) {
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((person) => person.name === student.resident)]
    const chair = room.furniture.find((piece) => piece.kind === "chair" && piece.name?.startsWith(student.resident + "が"))!
    const rest = chair.seat!.footRest!,
      seat = student.seat!
    const lift = seat.height * ROOM_SCALE - seatedSupport(look) * figureScale
    for (let frame = 0; frame < FRAMES.sit; frame++) {
      const time = ((frame + 0.5) / FRAMES.sit) * Math.PI * 2,
        k = skelFor(look, "sit", frame),
        anchor = seatedAnchor(look, time)
      expect(anchor).toEqual([k.p.pelvis[0], k.p.pelvis[2]])
      const table = room.furniture.find((piece) => piece.workSurface && Math.abs(piece.x - chair.x) < piece.w / 2 && piece.z < chair.z && chair.z - piece.z <= piece.d / 2 + 0.5 * ROOM_SCALE)!
      expect(table).toBeDefined()
      for (const side of ["l", "r"] as const) {
        const knee = k.p[`calf_${side}`],
          radius = 0.064 * (look.age === "child" ? 0.74 : 1) * figureScale
        const x = chair.x - (knee[0] - anchor[0]) * figureScale,
          z = chair.z - seat.forward * ROOM_SCALE - (knee[2] - anchor[1]) * figureScale
        expect(lift + knee[1] * figureScale + radius).toBeLessThan(table.workSurface!.height - table.workSurface!.thickness)
        for (const leg of workTableSections({ surface: table.workSurface!, x: table.x, z: table.z, width: table.w, depth: table.d }).filter((section) => section.part === "leg")) {
          const dx = Math.max(leg.x0 - x, x - leg.x1, 0),
            dz = Math.max(leg.z0 - z, z - leg.z1, 0)
          expect(Math.hypot(dx, dz)).toBeGreaterThan(radius)
        }
      }
      // buildLegs emits each shoe cap before torso, hands and held items.
      const shoes = buildBody(look, k, null)
        .prims.filter((primitive) => primitive.kind === "cap")
        .slice(0, 2)
      expect(shoes).toHaveLength(2)
      for (const shoe of shoes) {
        const sole = lift + (Math.min(shoe.a[1], shoe.b[1]) - shoe.r) * figureScale
        expect(Math.abs(sole - rest.height), `${student.resident}, frame ${frame}`).toBeLessThan(0.002)
        const toeX = chair.x - (shoe.b[0] - anchor[0]) * figureScale
        const toeZ = chair.z - seat.forward * ROOM_SCALE - (shoe.b[2] - anchor[1]) * figureScale
        expect(toeX - shoe.r * figureScale).toBeGreaterThan(chair.x - rest.width / 2)
        expect(toeX + shoe.r * figureScale).toBeLessThan(chair.x + rest.width / 2)
        expect(toeZ).toBeGreaterThan(chair.z - rest.forward - rest.depth / 2)
        expect(toeZ).toBeLessThan(chair.z - rest.forward + rest.depth / 2)
      }
    }
  }
})
