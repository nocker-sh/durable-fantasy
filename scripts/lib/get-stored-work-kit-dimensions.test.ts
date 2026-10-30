import { expect, it } from "vitest"
import { getStoredWorkKitDimensions } from "#/scripts/lib/get-stored-work-kit-dimensions"

function fixture() {
  const item = {
    id: "kit",
    name: "Kit",
    owner: "Berta",
    source: "test",
    kind: "box",
    board: 0,
    across_m: 0,
    from_back_m: 0.01,
    width_m: 0.24,
    height_m: 0.08,
    depth_m: 0.16,
    wall_thickness_m: 0.008,
    lid_thickness_m: 0.008,
  }
  return { item, shelf: { height_m: 1, board_thickness_m: 0.025, board_tops_m: [0.12, 1], front: "s", contents: [item] } }
}

it("reads current stored dimensions without copying them into the work plan or modifying storage", () => {
  const f = fixture()
  const before = JSON.stringify(f.shelf)
  expect(getStoredWorkKitDimensions({ shelf: f.shelf, id: "kit", owner: "Berta" })).toMatchObject({ width: 0.24, height: 0.08, depth: 0.16, wall: 0.008, lid: 0.008 })
  expect(JSON.stringify(f.shelf)).toBe(before)
  f.item.width_m = 0.25
  expect(getStoredWorkKitDimensions({ shelf: f.shelf, id: "kit", owner: "Berta" })).toMatchObject({ width: 0.25 })
})

it("requires the referenced box to exist and belong to the worker", () => {
  const f = fixture()
  expect(getStoredWorkKitDimensions({ shelf: f.shelf, id: "missing", owner: "Berta" })).toBeInstanceOf(Error)
  expect(getStoredWorkKitDimensions({ shelf: f.shelf, id: "kit", owner: "Other" })).toBeInstanceOf(Error)
  expect(getStoredWorkKitDimensions({ shelf: null, id: "kit", owner: "Berta" })).toBeInstanceOf(Error)
})

it("does not use linen or another kind of parcel as a hollow box", () => {
  const f = fixture()
  const linen = { id: "kit", name: "Linen", owner: "Berta", source: "test", kind: "linen", board: 0, across_m: 0, from_back_m: 0.01, width_m: 0.24, height_m: 0.08, depth_m: 0.16 }
  expect(getStoredWorkKitDimensions({ shelf: { ...f.shelf, contents: [linen] }, id: "kit", owner: "Berta" })).toEqual(new Error("Work kit storage item is not a box"))
})

it("rejects ambiguous stored box identities", () => {
  const f = fixture()
  expect(getStoredWorkKitDimensions({ shelf: { ...f.shelf, contents: [f.item, { ...f.item, width_m: 0.25 }] }, id: "kit", owner: "Berta" })).toEqual(
    new Error("Work kit storage box reference is missing or ambiguous"),
  )
})
