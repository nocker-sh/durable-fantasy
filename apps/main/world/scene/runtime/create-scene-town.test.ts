import { afterEach, expect, it } from "vitest"
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Scene } from "three"
import { createSceneTown } from "#/world/scene/runtime/create-scene-town"
import { movingObjects, stalls } from "#/world/scene/construction/registry"
import { resetRegistries } from "#/world/scene/construction/reset-registries"
import { layoutOf } from "#/world/maps/layouts"

afterEach(() => resetRegistries())

it("attaches the town before construction and preserves moving and independently hidden owners", () => {
  resetRegistries()
  const scene = new Scene()
  const material = new MeshBasicMaterial()
  const geometry = new BoxGeometry()
  const moving = new Group()
  const wares = new Group()
  const cover = new Group()
  const owner = new Group()
  moving.add(new Mesh(geometry, material))
  wares.add(new Mesh(geometry, material))
  cover.add(new Mesh(geometry, material))
  owner.add(wares, cover)
  const town = createSceneTown({
    scene,
    world: {
      layout: layoutOf("phanthiet"),
      centre: [0, 0],
      build: (root) => {
        expect(root.parent).toBe(scene)
        movingObjects.add(moving)
        stalls.test = { wares, cover, group: owner }
        root.add(moving, owner, new Mesh(geometry, material), new Mesh(geometry, material))
      },
    },
  })
  expect(town.parent).toBe(scene)
  expect(moving.parent).toBe(town)
  expect(owner.parent).toBe(town)
  expect(wares.parent).toBe(owner)
  expect(cover.parent).toBe(owner)
  expect(town.children).toHaveLength(3)
  expect(moving.matrixAutoUpdate).toBe(true)
})

it("keeps indoor meshes separate and retains partially built objects for scene cleanup", () => {
  const scene = new Scene()
  const geometry = new BoxGeometry()
  const material = new MeshBasicMaterial()
  const town = createSceneTown({
    scene,
    world: {
      layout: layoutOf("phanthiet"),
      centre: [0, 0],
      indoor: true,
      build: (root) => root.add(new Mesh(geometry, material), new Mesh(geometry, material)),
    },
  })
  expect(town.children).toHaveLength(2)
  const failure = new Error("building failed")
  expect(() =>
    createSceneTown({
      scene,
      world: {
        layout: layoutOf("phanthiet"),
        centre: [0, 0],
        build: (root) => {
          root.add(new Mesh(geometry, material))
          throw failure
        },
      },
    }),
  ).toThrow(failure)
  expect(scene.children).toHaveLength(2)
  expect(scene.children[1].children).toHaveLength(1)
})
