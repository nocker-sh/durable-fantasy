import { afterEach, expect, it, vi } from "vitest"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"
import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { SceneBuildProps } from "#/world/scene/runtime/scene-build-types"
import { PixelBuffer as GroundPixels } from "#/lib/graphics/pixel-buffer"

const factory = vi.hoisted(() => ({
  ground: vi.fn<(map: string) => Promise<PixelBuffer>>(),
  assemble: vi.fn<(props: SceneBuildProps & { resources: CleanupStack }) => Promise<{ dispose(): void }>>(),
}))
vi.mock("#/world/scene/ground-of", () => ({ groundOf: factory.ground }))
vi.mock("#/world/scene/runtime/assemble-scene-runtime", () => ({ assembleSceneRuntime: factory.assemble }))
vi.mock("#/world/lap", () => ({ lap: vi.fn() }))
import { createSceneRuntime } from "#/world/scene/runtime/create-scene-runtime"

afterEach(() => vi.resetAllMocks())

function deferred<T>() {
  const completion: { resolve(value: T): void } = {
    resolve: (_value: T) => {
      throw new Error("Promise not initialized")
    },
  }
  const promise = new Promise<T>((resolve) => {
    completion.resolve = resolve
  })
  return { promise, resolve: completion.resolve }
}

it("rejects an already abandoned request before painting or progress", async () => {
  const controller = new AbortController()
  const progress = vi.fn()
  controller.abort()
  await expect(createSceneRuntime("first", progress, { signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" })
  expect(progress).not.toHaveBeenCalled()
  expect(factory.ground).not.toHaveBeenCalled()
  expect(factory.assemble).not.toHaveBeenCalled()
})

it("allows painting to overlap but releases an abandoned assembly before the next one starts", async () => {
  const painting = deferred<PixelBuffer>()
  const building = deferred<{ dispose(): void }>()
  const started = deferred<void>()
  const controller = new AbortController()
  const order: string[] = []
  const firstGround = new GroundPixels(1, 1)
  const secondGround = new GroundPixels(2, 1)
  const options = { preview: true }
  factory.ground.mockImplementation((map) => (map === "first" ? Promise.resolve(firstGround) : painting.promise))
  factory.assemble.mockImplementation(async (props) => {
    order.push(props.map)
    if (props.map === "first") {
      expect(props.ground).toBe(firstGround)
      started.resolve(undefined)
      return building.promise
    }
    expect(props.ground).toBe(secondGround)
    expect(props.options).toBe(options)
    return { dispose: vi.fn() }
  })
  const first = createSceneRuntime("first", vi.fn(), { signal: controller.signal })
  const rejected = expect(first).rejects.toMatchObject({ name: "AbortError" })
  const second = createSceneRuntime("second", vi.fn(), { options })
  expect(factory.ground).toHaveBeenCalledTimes(2)
  await started.promise
  painting.resolve(secondGround)
  controller.abort()
  building.resolve({
    dispose: () => {
      order.push("released first")
    },
  })
  await rejected
  await second
  expect(order).toEqual(["first", "released first", "second"])
})

it("cleans partially acquired resources on failure and permits a later build", async () => {
  const release = vi.fn()
  const failure = new Error("assembly failed")
  factory.ground.mockResolvedValue(new GroundPixels(1, 1))
  factory.assemble.mockImplementationOnce(async (props) => {
    props.resources.use({ dispose: release })
    throw failure
  })
  factory.assemble.mockImplementationOnce(async () => ({ dispose: vi.fn() }))
  await expect(createSceneRuntime("failed", vi.fn())).rejects.toBe(failure)
  expect(release).toHaveBeenCalledOnce()
  await createSceneRuntime("next", vi.fn())
  expect(factory.assemble).toHaveBeenCalledTimes(2)
})

it("reports painting failure without entering assembly", async () => {
  const failure = new Error("paint failed")
  factory.ground.mockRejectedValue(failure)
  await expect(createSceneRuntime("failed", vi.fn())).rejects.toBe(failure)
  expect(factory.assemble).not.toHaveBeenCalled()
})
