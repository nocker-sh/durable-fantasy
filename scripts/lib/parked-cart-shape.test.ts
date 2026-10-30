import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { Box3 } from "three"
import { z } from "zod"
import { PARKED_CART_SHAPE } from "#/world/town/parked-cart-shape"
import { readSetting } from "#/scripts/lib/read-setting"
import { parkedCart } from "#/world/scene/construction/parked-cart"
import { SceneResources } from "#/lib/graphics/scene-resources"

it("fits the authored north-facing barn bay with its shafts towards the operator's use face", () => {
  const room = readSetting(readFileSync(".docs/settings/rooms/room-barn-2.md", "utf8")),
    piece = room.furniture?.find((piece) => piece.role === "parked_cart"),
    before = JSON.stringify(room)
  if (!piece || !room.grid) throw new Error("Missing authored cart reservation")
  const cell = room.grid.cell_m,
    width = piece.rect[2] * cell,
    depth = piece.rect[3] * cell
  const centre: [number, number] = [(piece.rect[0] + piece.rect[2] / 2) * cell, (piece.rect[1] + piece.rect[3] / 2) * cell],
    cart = parkedCart({ at: centre, size: [width, depth], floor: 0 })
  if (cart instanceof Error) throw cart
  const bounds = new Box3().setFromObject(cart),
    shaft = cart.getObjectByName("shaft-left"),
    bed = cart.getObjectByName("bed")
  if (!shaft || !bed) throw new Error("Missing shaft or bed")
  expect(piece.runtime_kind).toBe("parked-cart")
  expect(bounds.min.x).toBeGreaterThanOrEqual(piece.rect[0] * cell - 1e-6)
  expect(bounds.max.x).toBeLessThanOrEqual((piece.rect[0] + piece.rect[2]) * cell + 1e-6)
  expect(bounds.min.z).toBeGreaterThanOrEqual(piece.rect[1] * cell - 1e-6)
  expect(bounds.max.z).toBeLessThanOrEqual((piece.rect[1] + piece.rect[3]) * cell + 1e-6)
  const shaftBounds = new Box3().setFromObject(shaft),
    bedBounds = new Box3().setFromObject(bed)
  expect(shaftBounds.min.z).toBeLessThan(bedBounds.min.z)
  expect(shaftBounds.max.z).toBeGreaterThan(bedBounds.min.z)
  const connections = z.array(z.object({ target: z.string(), width_cells: z.number().positive() })).parse(room.connections),
    exit = connections.find((connection) => connection.target === "map-phanthiet")
  if (!exit) throw new Error("Missing dedicated exterior doorway")
  expect(exit.width_cells * cell).toBeGreaterThanOrEqual(PARKED_CART_SHAPE.width * cart.scale.x)
  expect(piece.access.every((point) => point[1] < piece.rect[1])).toBe(true)
  expect(JSON.stringify(room)).toBe(before)
  new SceneResources(cart).dispose()
})
