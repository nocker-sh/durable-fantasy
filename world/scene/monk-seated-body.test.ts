import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { seatDimensions } from "../../scripts/lib/seat-dimensions"
import { workSurface } from "../../scripts/lib/work-surface"
import { RESIDENTS, RESIDENT_LOOKS } from "../town/residents"
import { seatHeading } from "#/world/town/seat-heading"
import { workTableSections } from "../town/work-table"
import { FRAMES } from "#/world/scene/figure/animation"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { buildBody } from "./figure/body"
import { seatedRoot } from "#/world/scene/seated-root"
it("supports each monk's shoes and clears the tabletop and legs in every seated frame", () => {
  const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h10-1.md", import.meta.url), "utf8")),
    k = room.grid!.cell_m
  for (const [symbol, name] of [
    ["A", "ベネディクト"],
    ["E", "クレメンス"],
    ["C", "ベネディクト"],
    ["C", "クレメンス"],
  ]) {
    const chair = room.furniture!.find((f) => f.symbol === symbol)!,
      table = room.furniture!.find((f) => f.seat_symbols?.includes(symbol))!
    const seat = seatDimensions(chair.seat, chair.rect[2] * k, chair.rect[3] * k),
      surface = workSurface(table.work_surface, table.rect[2] * k, table.rect[3] * k)
    const look = RESIDENT_LOOKS[RESIDENTS.findIndex((person) => person.name === name)],
      heading = seatHeading(seat.facing!),
      cos = Math.cos(heading),
      sin = Math.sin(heading)
    const at: [number, number] = [(chair.rect[0] + chair.rect[2] / 2) * k, (chair.rect[1] + chair.rect[3] / 2) * k]
    const legs = workTableSections({
      surface: surface,
      x: (table.rect[0] + table.rect[2] / 2) * k,
      z: (table.rect[1] + table.rect[3] / 2) * k,
      width: table.rect[2] * k,
      depth: table.rect[3] * k,
    }).filter((p) => p.part === "leg")
    for (let frame = 0; frame < FRAMES.sit; frame++) {
      const time = ((frame + 0.5) / FRAMES.sit) * Math.PI * 2,
        skel = skelFor(look, "sit", frame),
        root = seatedRoot({ look: look, time: time, place: { at, height: seat.height, heading }, scale: 1 })
      const point = (p: readonly number[]) => [root[0] + p[0] * cos + p[2] * sin, root[1] + p[1], root[2] - p[0] * sin + p[2] * cos]
      const shoes = buildBody(look, skel, null)
        .prims.filter((p) => p.kind === "cap")
        .slice(0, 2)
      for (const shoe of shoes) {
        expect(Math.abs(root[1] + Math.min(shoe.a[1], shoe.b[1]) - shoe.r), `${name} ${symbol} sole ${frame}`).toBeLessThan(0.002)
        const a = point(shoe.a),
          b = point(shoe.b)
        for (const leg of legs) expect(segmentRectDistance([leg.x0, leg.z0, leg.x1, leg.z1], [a[0], a[2]], [b[0], b[2]]), `${name} ${symbol} shoe/leg ${frame}`).toBeGreaterThan(shoe.r)
      }
      for (const side of ["l", "r"] as const) {
        const knee = point(skel.p[`calf_${side}`]),
          radius = 0.064
        expect(knee[1] + radius, `${name} ${symbol} tabletop ${frame}`).toBeLessThan(surface.height - surface.thickness)
        for (const leg of legs) {
          const dx = Math.max(leg.x0 - knee[0], knee[0] - leg.x1, 0),
            dz = Math.max(leg.z0 - knee[2], knee[2] - leg.z1, 0)
          expect(Math.hypot(dx, dz), `${name} ${symbol} leg ${frame}`).toBeGreaterThan(radius)
        }
      }
    }
  }
})
