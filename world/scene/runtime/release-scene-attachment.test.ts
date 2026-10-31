import { expect, it, vi } from "vitest"
import { releaseSceneAttachment } from "#/world/scene/runtime/release-scene-attachment"

it("stops and disconnects notifications before releasing the observer, canvas, runtime and layer", () => {
  const order: string[] = []
  const runtime = {
    running: true,
    events: null,
    renderer: {
      domElement: {
        remove: () => {
          order.push("canvas")
        },
      },
    },
    dispose: () => {
      order.push("runtime")
    },
  }
  const observer = {
    disconnect: () => {
      expect(runtime.running).toBe(false)
      expect(runtime.events).toBeNull()
      order.push("observer")
    },
  }
  const layer = {
    remove: () => {
      order.push("layer")
    },
  }
  releaseSceneAttachment({ runtime, observer, layer })
  expect(order).toEqual(["observer", "canvas", "runtime", "layer"])
})

it("retains multiple failures and still releases every later resource", () => {
  const observerError = new Error("observer failed")
  const canvasError = new Error("canvas failed")
  const dispose = vi.fn()
  const remove = vi.fn()
  const runtime = {
    running: true,
    events: null,
    renderer: {
      domElement: {
        remove: () => {
          throw canvasError
        },
      },
    },
    dispose,
  }
  try {
    releaseSceneAttachment({
      runtime,
      observer: {
        disconnect: () => {
          throw observerError
        },
      },
      layer: { remove },
    })
    expect.unreachable("must report both failures")
  } catch (error) {
    expect(error).toBeInstanceOf(AggregateError)
    if (error instanceof AggregateError) expect(error.errors).toEqual([observerError, canvasError])
  }
  expect(runtime.running).toBe(false)
  expect(dispose).toHaveBeenCalledOnce()
  expect(remove).toHaveBeenCalledOnce()
})
