import { expect, it } from "vitest"
import { Box3, Group, InstancedMesh, Matrix4, Mesh, Raycaster, Vector3 } from "three"
import { parkedCart } from "#/world/scene/construction/parked-cart"
import { PARKED_CART_SHAPE } from "#/world/town/parked-cart-shape"
import { SceneResources } from "#/lib/graphics/scene-resources"
import { getFurnitureKind } from "#/world/town/get-furniture-kind"
import { HOUSES } from "#/world/town/houses"
import { interiorPlan } from "#/world/town/interior-plan"
import { interiorRows } from "#/world/town/interior-rows"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { setLayout } from "#/world/scene/set-layout"

it("keeps the bed, wheels, supports and full shafts in both parking orientations without flattening the wheels", () => {
  for (const size of [
    [1.4, 2.6],
    [2.5, 1.5],
    [1, 1],
  ] satisfies [number, number][]) {
    const props = { at: [12, 18] satisfies [number, number], size, floor: 0.3 },
      before = JSON.stringify(props),
      cart = parkedCart(props)
    if (cart instanceof Error) throw cart
    const bounds = new Box3().setFromObject(cart),
      wheel = cart.getObjectByName("wheel--1"),
      leg = cart.getObjectByName("leg-left")
    if (!wheel || !leg) throw new Error("Missing floor contacts")
    expect(bounds.min.x).toBeGreaterThanOrEqual(props.at[0] - size[0] / 2 - 1e-6)
    expect(bounds.max.x).toBeLessThanOrEqual(props.at[0] + size[0] / 2 + 1e-6)
    expect(bounds.min.z).toBeGreaterThanOrEqual(props.at[1] - size[1] / 2 - 1e-6)
    expect(bounds.max.z).toBeLessThanOrEqual(props.at[1] + size[1] / 2 + 1e-6)
    expect(bounds.min.y).toBeCloseTo(props.floor)
    expect(new Box3().setFromObject(wheel).min.y).toBeCloseTo(props.floor)
    expect(new Box3().setFromObject(leg).min.y).toBeCloseTo(props.floor)
    expect(cart.scale.x).toBe(cart.scale.y)
    expect(cart.scale.x).toBe(cart.scale.z)
    if (size[0] > size[1]) expect(cart.rotation.y).toBe(Math.PI / 2)
    if (size[0] <= size[1]) expect(cart.rotation.y).toBe(0)
    const wheelSize = new Box3().setFromObject(wheel).getSize(new Vector3())
    expect(Math.max(wheelSize.x, wheelSize.z)).toBeCloseTo(wheelSize.y)
    expect(JSON.stringify(props)).toBe(before)
    new SceneResources(cart).dispose()
  }
})

it("connects the shafts, supports, axle and hubs while leaving the cargo bed open and empty", () => {
  const cart = parkedCart({ at: [0, 0], size: [1, 1.9], floor: 0 })
  if (cart instanceof Error) throw cart
  const bounds = new Map<string, Box3>()
  cart.traverse((object) => {
    if (object.name) bounds.set(object.name, new Box3().setFromObject(object))
  })
  for (const pair of [
    ["shaft-left", "bed"],
    ["shaft-right", "bed"],
    ["leg-left", "shaft-left"],
    ["leg-right", "shaft-right"],
    ["bearer-left", "bed"],
    ["bearer-right", "bed"],
    ["bearer-left", "axle"],
    ["bearer-right", "axle"],
    ["axle", "wheel--1"],
    ["axle", "wheel-1"],
  ]) {
    const first = bounds.get(pair[0]),
      second = bounds.get(pair[1])
    if (!first || !second) throw new Error("Missing connected part")
    expect(first.intersectsBox(second), pair.join(" to ")).toBe(true)
  }
  const contacts = new Raycaster(new Vector3(0, 2, 0.25), new Vector3(0, -1, 0)).intersectObject(cart, true)
  expect(contacts[0].object.name).toBe("bed")
  expect(contacts[0].point.y).toBeCloseTo(0.55)
  expect(cart.getObjectByName("load")).toBeUndefined()
  new SceneResources(cart).dispose()
})

it("uses finite radial spokes that reach the hub and the inner rim instead of floating inside the wheel", () => {
  const cart = parkedCart({ at: [0, 0], size: [1, 1.9], floor: 0 })
  if (cart instanceof Error) throw cart
  const wheel = cart.getObjectByName("wheel-1"),
    spokes = wheel?.getObjectByName("spokes"),
    shape = PARKED_CART_SHAPE.wheel
  if (!(spokes instanceof InstancedMesh)) throw new Error("Missing spokes")
  expect(spokes.count).toBe(8)
  for (const index of Array.from({ length: spokes.count }).keys()) {
    const matrix = new Matrix4()
    spokes.getMatrixAt(index, matrix)
    const inner = new Vector3(0, -shape.spokeLength / 2, 0).applyMatrix4(matrix),
      outer = new Vector3(0, shape.spokeLength / 2, 0).applyMatrix4(matrix)
    expect(inner.length()).toBeLessThan(shape.hubRadius)
    expect(outer.length()).toBeGreaterThan(shape.radius - shape.rim * 2)
  }
  cart.traverse((object) => {
    if (object instanceof Mesh) expect(Array.from(object.geometry.getAttribute("position").array).every(Number.isFinite)).toBe(true)
  })
  new SceneResources(cart).dispose()
})

it("uses the actual empty-cart renderer for the barn without changing its walk grid", () => {
  const house = HOUSES.find((house) => house.id === "barn")
  if (!house) throw new Error("Missing barn")
  const room = interiorPlan(house),
    former = {
      ...room,
      furniture: room.furniture.map((piece) => {
        if (piece.name === "荷車") return { ...piece, kind: "crate" } satisfies typeof piece
        return piece
      }),
    }
  expect(getFurnitureKind("荷車")).toBe("parked-cart")
  expect(getFurnitureKind("木箱")).toBe("crate")
  expect(interiorRows(room)).toEqual(interiorRows(former))
  setLayout(INDOOR)
  const root = new Group()
  buildInterior(room)(root)
  expect(root.getObjectByName("parked-cart")?.getObjectByName("wheel-1")).toBeDefined()
  new SceneResources(root).dispose()
})

it("rejects malformed placements and scales before constructing geometry", () => {
  for (const value of [0, -1, NaN, Infinity, Number.MAX_VALUE, Number.MIN_VALUE]) expect(parkedCart({ at: [0, 0], size: [value, value], floor: 0 })).toBeInstanceOf(Error)
  expect(parkedCart({ at: [NaN, 0], size: [1, 2], floor: 0 })).toBeInstanceOf(Error)
  expect(parkedCart({ at: [0, 0], size: [1, 2], floor: Infinity })).toBeInstanceOf(Error)
})
