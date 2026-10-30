import { expect, it } from "vitest"
import { scaleRoomPieceDimensions } from "#/world/town/scale-room-piece-dimensions"
import { getChairSections } from "#/world/town/get-chair-sections"
import { workTableSections } from "#/world/town/work-table"
import type { Placed } from "#/world/town/floorplan/types"
const chair: Placed = {
  name: "椅子",
  label: "C",
  floor: 1,
  kind: "chair",
  solid: true,
  wall: false,
  x0: 2,
  x1: 2.5,
  z0: 3,
  z1: 3.5,
  seat: {
    facing: "e",
    width: 0.45,
    depth: 0.4,
    height: 0.4,
    backHeight: 0.8,
    boardThickness: 0.025,
    legWidth: 0.05,
    occupantForward: 0.2,
    footRest: { height: 0.1, width: 0.35, depth: 0.2, forward: 0.28, thickness: 0.025 },
  },
}

it("projects every solid chair section and foot support while keeping grid placement, floor and facing intact", () => {
  const before = JSON.stringify(chair),
    scaled = scaleRoomPieceDimensions(chair, 1.5)
  if (!chair.seat || !scaled.seat) throw new Error("Missing chair dimensions")
  const base = getChairSections({ seat: chair.seat, at: [0.2, 0.3], floor: 0.1, legInset: 0.01, backThickness: 0.02, hasBack: true })
  const projected = getChairSections({ seat: scaled.seat, at: [0.3, 0.45], floor: 0.15, legInset: 0.015, backThickness: 0.03, hasBack: true })
  expect(projected.length).toBe(base.length)
  for (const pair of base.entries())
    for (const axis of ["x0", "x1", "y0", "y1", "z0", "z1"] satisfies (keyof (typeof pair)[1])[]) expect(projected[pair[0]][axis]).toBeCloseTo(Number(pair[1][axis]) * 1.5, 12)
  expect([scaled.x0, scaled.x1, scaled.z0, scaled.z1, scaled.floor, scaled.label, scaled.seat.facing]).toEqual([2, 2.5, 3, 3.5, 1, "C", "e"])
  expect(scaled.seat.occupantForward).toBeCloseTo(0.3, 12)
  expect(JSON.stringify(chair)).toBe(before)
})

it("keeps the tabletop and all legs in the same units as their knee clearance", () => {
  const table: Placed = {
      name: "食卓",
      floor: 0,
      kind: "table",
      solid: true,
      wall: false,
      x0: 0,
      x1: 1.2,
      z0: 0,
      z1: 0.8,
      workSurface: { height: 0.7, thickness: 0.03, legWidth: 0.06, legInset: 0.1, kneeClearance: 0.2 },
    },
    scaled = scaleRoomPieceDimensions(table, 2)
  if (!table.workSurface || !scaled.workSurface) throw new Error("Missing table dimensions")
  const base = workTableSections({ surface: table.workSurface, x: 0.2, z: 0.3, width: 1.2, depth: 0.8, floor: 0.1 }),
    projected = workTableSections({ surface: scaled.workSurface, x: 0.4, z: 0.6, width: 2.4, depth: 1.6, floor: 0.2 })
  for (const pair of base.entries())
    for (const axis of ["x0", "x1", "y0", "y1", "z0", "z1"] satisfies (keyof (typeof pair)[1])[]) expect(projected[pair[0]][axis]).toBeCloseTo(Number(pair[1][axis]) * 2, 12)
  expect(scaled.workSurface.kneeClearance).toBe(0.4)
})

it("rejects a collapsed, reversed or nonfinite projection", () => {
  for (const scale of [0, -1, NaN, Infinity]) expect(() => scaleRoomPieceDimensions(chair, scale)).toThrow("Invalid room piece scale")
})
