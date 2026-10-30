import { expect, it } from "vitest"
import { Box3, Mesh, Vector3 } from "three"
import { waterJar } from "#/world/scene/construction/water-jar"
import { M } from "#/world/scene/construction/materials"
import { SceneResources } from "#/lib/graphics/scene-resources"
import { HOUSES } from "#/world/town/houses"
import { interiorPlan } from "#/world/town/interior-plan"
import { interiorRows } from "#/world/town/interior-rows"
import { getFurnitureKind } from "#/world/town/get-furniture-kind"
import { buildInterior } from "#/world/scene/build-interior"
import { INDOOR } from "#/world/maps/ground-layouts"
import { Group } from "three"
import { setLayout } from "#/world/scene/set-layout"

it("grounds a hollow ceramic body and seated lid inside square and rectangular footprints", () => {
  for (const size of [
    [0.5, 0.5],
    [0.65, 1],
    [1, 0.4],
  ] satisfies [number, number][]) {
    const props = { at: [12, 18] satisfies [number, number], size, floor: 0.3 },
      before = JSON.stringify(props),
      jar = waterJar(props)
    if (jar instanceof Error) throw jar
    const bounds = new Box3().setFromObject(jar),
      body = jar.getObjectByName("body"),
      lid = jar.getObjectByName("lid")
    if (!body || !lid) throw new Error("Missing jar parts")
    expect(bounds.min.x).toBeGreaterThanOrEqual(props.at[0] - size[0] / 2)
    expect(bounds.max.x).toBeLessThanOrEqual(props.at[0] + size[0] / 2)
    expect(bounds.min.z).toBeGreaterThanOrEqual(props.at[1] - size[1] / 2)
    expect(bounds.max.z).toBeLessThanOrEqual(props.at[1] + size[1] / 2)
    expect(bounds.min.y).toBeCloseTo(props.floor)
    expect(new Box3().setFromObject(body).max.y).toBeCloseTo(new Box3().setFromObject(lid).min.y)
    expect(new Box3().setFromObject(lid).getSize(new Vector3()).x).toBeGreaterThan(Math.min(...size) * 0.64)
    jar.traverse((object) => {
      if (!(object instanceof Mesh)) return
      expect(object.material).toBe(M.ceramic)
      expect(Array.from(object.geometry.getAttribute("position").array).every(Number.isFinite)).toBe(true)
      expect(Array.from(object.geometry.getAttribute("normal").array).every(Number.isFinite)).toBe(true)
    })
    expect(JSON.stringify(props)).toBe(before)
    new SceneResources(jar).dispose()
  }
})

it("keeps the real cavity and flat base instead of sealing the mouth with a solid body cap", () => {
  const jar = waterJar({ at: [0, 0], size: [1, 1], floor: 0 })
  if (jar instanceof Error) throw jar
  const body = jar.getObjectByName("body")
  if (!(body instanceof Mesh)) throw new Error("Missing body")
  const vertices = body.geometry.getAttribute("position"),
    rimRadii: number[] = [],
    baseRadii: number[] = []
  for (const index of Array.from({ length: vertices.count }).keys()) {
    const radius = Math.hypot(vertices.getX(index), vertices.getZ(index)),
      height = vertices.getY(index)
    if (Math.abs(height - 1.06) < 1e-6) rimRadii.push(radius)
    if (Math.abs(height) < 1e-6) baseRadii.push(radius)
  }
  expect(Math.min(...rimRadii)).toBeCloseTo(0.28)
  expect(Math.max(...rimRadii)).toBeCloseTo(0.32)
  expect(Math.max(...baseRadii)).toBeCloseTo(0.28)
  expect(rimRadii.every((radius) => radius > 0)).toBe(true)
  new SceneResources(jar).dispose()
})

it("replaces only the water-jar classification and uses its actual renderer in the existing house", () => {
  const house = HOUSES.find((house) => house.id === "h4")
  if (!house) throw new Error("Missing home")
  const room = interiorPlan(house),
    jar = room.furniture.find((piece) => piece.name === "水甕")
  expect(getFurnitureKind("水甕")).toBe("water-jar")
  expect(getFurnitureKind("酒樽")).toBe("barrel")
  expect(getFurnitureKind("洗濯桶")).toBe("barrel")
  expect(jar?.kind).toBe("water-jar")
  const former = {
    ...room,
    furniture: room.furniture.map((piece) => {
      if (piece.name === "水甕") return { ...piece, kind: "barrel" } satisfies typeof piece
      return piece
    }),
  }
  expect(interiorRows(room)).toEqual(interiorRows(former))
  setLayout(INDOOR)
  const root = new Group()
  buildInterior(room)(root)
  expect(root.getObjectByName("water-jar")?.getObjectByName("lid")).toBeDefined()
  new SceneResources(root).dispose()
})

it("rejects nonpositive and nonfinite dimensions before creating malformed meshes", () => {
  for (const value of [0, -1, NaN, Infinity, Number.MAX_VALUE]) expect(waterJar({ at: [0, 0], size: [value, value], floor: 0 })).toBeInstanceOf(Error)
  expect(waterJar({ at: [NaN, 0], size: [1, 1], floor: 0 })).toBeInstanceOf(Error)
  expect(waterJar({ at: [0, 0], size: [1, 1], floor: Infinity })).toBeInstanceOf(Error)
})
