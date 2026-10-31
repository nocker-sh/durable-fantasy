import { afterEach, expect, it, vi } from "vitest"
import { BoxGeometry, MeshBasicMaterial, Mesh } from "three"
import type * as ThreeLibrary from "three"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { createSceneRenderer } from "#/world/scene/runtime/create-scene-renderer"
import { createSceneRoot } from "#/world/scene/runtime/create-scene-root"

const trace = vi.hoisted((): string[] => [])
vi.mock("three", async (original) => {
  const actual = await original<typeof ThreeLibrary>()
  return {
    ...actual,
    WebGLRenderer: class {
      shadowMap = {}
      domElement = { style: {} }
      dispose() {
        trace.push("renderer")
      }
      forceContextLoss() {
        trace.push("context")
      }
    },
  }
})
afterEach(() => {
  trace.length = 0
  vi.restoreAllMocks()
})

it("owns scene assets before the renderer and releases shared assets only once", () => {
  const resources = new CleanupStack()
  createSceneRenderer(resources)
  const scene = createSceneRoot(resources)
  const geometry = new BoxGeometry()
  const material = new MeshBasicMaterial()
  geometry.addEventListener("dispose", () => trace.push("geometry"))
  material.addEventListener("dispose", () => trace.push("material"))
  scene.add(new Mesh(geometry, material), new Mesh(geometry, material))
  resources.dispose()
  resources.dispose()
  expect(trace.filter((entry) => entry === "geometry")).toHaveLength(1)
  expect(trace.filter((entry) => entry === "material")).toHaveLength(1)
  expect(trace.slice(-2)).toEqual(["renderer", "context"])
})

it("returns the WebGL context even when renderer disposal fails", () => {
  const resources = new CleanupStack()
  const renderer = createSceneRenderer(resources)
  vi.spyOn(renderer, "dispose").mockImplementation(() => {
    throw Error("Disposal failed")
  })
  expect(() => resources.dispose()).toThrow()
  expect(trace).toEqual(["context"])
})
