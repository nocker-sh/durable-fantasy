import { afterEach, expect, it, vi } from "vitest"
import { BoxGeometry, MeshBasicMaterial, Mesh } from "three"
import type * as ThreeLibrary from "three"
import { CleanupStack } from "#/lib/engine/cleanup-stack"
import { createSceneRenderer, keepPrograms } from "#/world/scene/runtime/create-scene-renderer"
import { createSceneRoot } from "#/world/scene/runtime/create-scene-root"

const trace = vi.hoisted((): string[] => [])
vi.mock("three", async (original) => {
  const actual = await original<typeof ThreeLibrary>()
  return {
    ...actual,
    WebGLRenderer: class {
      shadowMap = {}
      domElement = { style: {} }
      lost = false
      info = { programs: [{ usedTimes: 1 }, { usedTimes: 2 }] }
      renderLists = { dispose: () => trace.push("lists") }
      getContext() {
        return { isContextLost: () => this.lost }
      }
      setRenderTarget() {}
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

it("releases scene assets once and keeps the renderer for the next map", () => {
  const resources = new CleanupStack()
  const renderer = createSceneRenderer(resources)
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
  expect(trace).not.toContain("renderer")
  expect(trace).not.toContain("context")
  const next = new CleanupStack()
  expect(createSceneRenderer(next)).toBe(renderer)
  next.dispose()
})

it("keeps each compiled program once", () => {
  const resources = new CleanupStack()
  const renderer = createSceneRenderer(resources)
  keepPrograms(renderer)
  keepPrograms(renderer)
  expect(renderer.info.programs?.map((program) => program.usedTimes)).toEqual([2, 3])
  resources.dispose()
})

it("returns the WebGL context of a second renderer, even when its disposal fails", () => {
  const first = new CleanupStack()
  const second = new CleanupStack()
  createSceneRenderer(first)
  const extra = createSceneRenderer(second)
  first.dispose()
  vi.spyOn(extra, "dispose").mockImplementation(() => {
    throw Error("Disposal failed")
  })
  expect(() => second.dispose()).toThrow()
  expect(trace).toContain("context")
})

it("does not reuse a renderer whose context was lost", () => {
  const resources = new CleanupStack()
  const renderer = createSceneRenderer(resources)
  resources.dispose()
  ;(renderer as unknown as { lost: boolean }).lost = true
  const next = new CleanupStack()
  expect(createSceneRenderer(next)).not.toBe(renderer)
  expect(trace.slice(-2)).toEqual(["renderer", "context"])
  next.dispose()
})
