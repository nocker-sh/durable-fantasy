import { afterEach, beforeEach, expect, it, vi } from "vitest"

vi.mock("./ground-version", () => ({ GROUND_VERSION: "test-ground" }))
vi.mock("./terrain", () => ({ GROUND_PX: 2 }))
vi.mock("#/world/scene/paint-rows", () => ({ paintRows: vi.fn() }))
const groundLayout = vi.hoisted(() => ({ value: { id: "original" } }))
vi.mock("#/world/scene/has-fields", () => ({ hasFields: () => false }))
vi.mock("#/world/scene/prime-fields", () => ({ primeFields: vi.fn() }))
vi.mock("#/world/scene/current-layout", () => ({ currentLayout: () => groundLayout.value }))
vi.mock("#/world/scene/set-layout", () => ({
  setLayout: vi.fn((next) => {
    groundLayout.value = next
  }),
}))

vi.mock("../maps/layouts", () => ({ layoutOf: (id: string) => ({ id }) }))

class WorkerStub {
  static all: WorkerStub[] = []
  job?: { map: string; y0: number; y1: number }
  onmessage?: (event: { data: { data: Uint8ClampedArray; y0: number; fields?: unknown } }) => void
  onerror?: (event: { preventDefault(): void }) => void
  onmessageerror?: () => void
  terminate = vi.fn()
  constructor() {
    WorkerStub.all.push(this)
  }
  postMessage(job: WorkerStub["job"]) {
    this.job = job
  }
  finish() {
    this.onmessage?.({ data: { data: new Uint8ClampedArray((this.job!.y1 - this.job!.y0) * 2 * 4).fill(7), y0: this.job!.y0 } })
  }
  fail() {
    this.onerror?.({ preventDefault() {} })
  }
}

beforeEach(async () => {
  WorkerStub.all = []
  vi.stubGlobal("Worker", WorkerStub)
  vi.stubGlobal("navigator", { hardwareConcurrency: 2 })
  vi.stubGlobal("indexedDB", undefined)
  // Load the module as fixture setup, before measuring the asynchronous painting behavior.
  await import("#/world/scene/ground-of")
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  vi.resetModules()
})

it("joins an active prefetch instead of starting a second painter", async () => {
  const groundOf = (await import("#/world/scene/ground-of")).groundOf,
    prefetchGround = (await import("#/world/scene/prefetch-ground")).prefetchGround
  prefetchGround("a")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(1))
  const first = groundOf("a"),
    second = groundOf("a")
  expect(first).toBe(second)
  WorkerStub.all[0].finish()
  expect((await first).data[0]).toBe(7)
  expect(WorkerStub.all).toHaveLength(1)
})

it("starts entry into a queued map without waiting for unrelated prefetches", async () => {
  const groundOf = (await import("#/world/scene/ground-of")).groundOf,
    prefetchGround = (await import("#/world/scene/prefetch-ground")).prefetchGround
  prefetchGround("a")
  prefetchGround("b")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(1))
  const entering = groundOf("b")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(2))
  expect(WorkerStub.all[1].job?.map).toBe("b")
  WorkerStub.all[1].finish()
  await entering
  WorkerStub.all[0].finish()
  await new Promise((r) => setTimeout(r, 0))
  expect(WorkerStub.all).toHaveLength(2)
})

it("retries a failed prefetch", async () => {
  const groundOf = (await import("#/world/scene/ground-of")).groundOf,
    prefetchGround = (await import("#/world/scene/prefetch-ground")).prefetchGround
  prefetchGround("a")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(1))
  WorkerStub.all[0].fail()
  await new Promise((r) => setTimeout(r, 0))
  prefetchGround("a")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(2))
  const entering = groundOf("a")
  WorkerStub.all[1].finish()
  await entering
})

it("promotes fallback permission and restores the layout after main-thread painting", async () => {
  const groundOf = (await import("#/world/scene/ground-of")).groundOf,
    prefetchGround = (await import("#/world/scene/prefetch-ground")).prefetchGround
  // Import after resetModules so these are the instances used by ground.ts.
  const world = {
    ...(await import("#/world/scene/world")),
    ...(await import("#/world/scene/river-x")),
    ...(await import("#/lib/engine/in-rect")),
    ...(await import("#/world/scene/ensure-fields")),
    ...(await import("#/world/scene/current-layout")),
    ...(await import("#/world/scene/set-layout")),
    ...(await import("#/world/scene/fields-now")),
    ...(await import("#/world/scene/prime-fields")),
    ...(await import("#/world/scene/has-fields")),
    ...(await import("#/world/scene/ground-h")),
    ...(await import("#/world/scene/river-d")),
    ...(await import("#/world/scene/road-d")),
    ...(await import("#/world/scene/trail-d")),
    ...(await import("#/world/scene/road-kind")),
    ...(await import("#/world/scene/bridge-deck-h")),
    ...(await import("#/world/scene/set-walk-surfaces")),
    ...(await import("#/world/scene/add-walk-surfaces")),
    ...(await import("#/world/scene/walk-h")),
    ...(await import("#/world/scene/block-rect")),
    ...(await import("#/world/scene/block-circle")),
    ...(await import("#/world/scene/init-walk")),
    ...(await import("#/world/scene/is-free")),
  }
  const terrain = {
    ...(await import("#/world/scene/terrain")),
    ...(await import("#/world/scene/paint-ground")),
    ...(await import("#/world/scene/paint-rows")),
    ...(await import("#/world/scene/mesh-heights")),
  }
  const previous = world.currentLayout()
  prefetchGround("a")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(1))
  const entering = groundOf("a")
  WorkerStub.all[0].fail()
  await entering
  expect(terrain.paintRows).toHaveBeenCalledOnce()
  expect(world.currentLayout()).toBe(previous)
  expect(world.setLayout).toHaveBeenLastCalledWith(previous)
})

it("does not retain a failed entry promise", async () => {
  const groundOf = (await import("#/world/scene/ground-of")).groundOf
  const terrain = {
    ...(await import("#/world/scene/terrain")),
    ...(await import("#/world/scene/paint-ground")),
    ...(await import("#/world/scene/paint-rows")),
    ...(await import("#/world/scene/mesh-heights")),
  }
  vi.mocked(terrain.paintRows).mockImplementationOnce(() => {
    throw new Error("paint failed")
  })
  const first = groundOf("a")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(1))
  WorkerStub.all[0].fail()
  await expect(first).rejects.toThrow("paint failed")
  const retry = groundOf("a")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(2))
  WorkerStub.all[1].finish()
  await expect(retry).resolves.toBeDefined()
})

it("returns painted ground before persistence completes and shares it during the write", async () => {
  const writes: { oncomplete?: () => void; onabort?: () => void }[] = []
  const store = {
    get: () => {
      const request = { result: undefined, onsuccess: () => {} }
      queueMicrotask(() => request.onsuccess())
      return request
    },
    getAllKeys: () => {
      const request = { result: [], onsuccess: () => {} }
      queueMicrotask(() => request.onsuccess())
      return request
    },
    put: vi.fn(),
  }
  vi.stubGlobal("indexedDB", {
    open: () => {
      const request = {
        result: {
          transaction: (_: string, mode?: string) => {
            const tx = { objectStore: () => store, oncomplete: undefined as (() => void) | undefined, onabort: undefined as (() => void) | undefined }
            if (mode === "readwrite") writes.push(tx)
            return tx
          },
        },
        onsuccess: () => {},
      }
      queueMicrotask(() => request.onsuccess())
      return request
    },
  })
  const groundOf = (await import("#/world/scene/ground-of")).groundOf
  const first = groundOf("a")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(1))
  WorkerStub.all[0].finish()
  const pixels = await first
  expect(writes).toHaveLength(1)
  expect(store.put).toHaveBeenCalledOnce()
  // Another map evicts the in-memory entry while the first map is still saving.
  const other = groundOf("b")
  expect(await groundOf("a")).toBe(pixels)
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(2))
  expect(WorkerStub.all.filter((worker) => worker.job?.map === "a")).toHaveLength(1)
  WorkerStub.all[1].finish()
  await other
  writes[0].oncomplete?.()
  writes[1].onabort?.()
})

it("paints the current ground when opening the optional cache never finishes", async () => {
  vi.useFakeTimers()
  const open = vi.fn(() => ({}))
  vi.stubGlobal("indexedDB", { open })
  const groundOf = (await import("#/world/scene/ground-of")).groundOf
  const result = groundOf("a")
  await vi.advanceTimersByTimeAsync(4999)
  expect(WorkerStub.all).toHaveLength(0)
  await vi.advanceTimersByTimeAsync(1)
  expect(WorkerStub.all).toHaveLength(1)
  WorkerStub.all[0].finish()
  expect((await result).data[0]).toBe(7)
  const next = groundOf("b")
  await vi.advanceTimersByTimeAsync(0)
  expect(WorkerStub.all).toHaveLength(2)
  WorkerStub.all[1].finish()
  await next
  // Writes have a separate deadline and cannot delay displaying either map.
  await vi.advanceTimersByTimeAsync(5000)
  expect(open).toHaveBeenCalledOnce()
})

it("falls back for constructor and message transfer failures in the entered map", async () => {
  const groundOf = (await import("#/world/scene/ground-of")).groundOf
  const terrain = {
    ...(await import("#/world/scene/terrain")),
    ...(await import("#/world/scene/paint-ground")),
    ...(await import("#/world/scene/paint-rows")),
    ...(await import("#/world/scene/mesh-heights")),
  }
  vi.spyOn(WorkerStub.prototype, "postMessage").mockImplementationOnce(() => {
    throw new Error("transfer failed")
  })
  await expect(groundOf("transfer")).resolves.toBeDefined()
  expect(WorkerStub.all[0].terminate).toHaveBeenCalledOnce()
  vi.stubGlobal(
    "Worker",
    class {
      constructor() {
        throw new Error("worker unavailable")
      }
    },
  )
  await expect(groundOf("constructor")).resolves.toBeDefined()
  expect(terrain.paintRows).toHaveBeenCalledTimes(2)
})

it("recovers an undecodable worker reply without waiting forever", async () => {
  const groundOf = (await import("#/world/scene/ground-of")).groundOf
  const terrain = {
    ...(await import("#/world/scene/terrain")),
    ...(await import("#/world/scene/paint-ground")),
    ...(await import("#/world/scene/paint-rows")),
    ...(await import("#/world/scene/mesh-heights")),
  }
  const result = groundOf("decode")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(1))
  WorkerStub.all[0].onmessageerror?.()
  await expect(result).resolves.toBeDefined()
  expect(terrain.paintRows).toHaveBeenCalledOnce()
  expect(WorkerStub.all[0].terminate).toHaveBeenCalledOnce()
})

it.each(["offset", "length"])("does not accept a corrupt band's %s", async (invalid) => {
  const groundOf = (await import("#/world/scene/ground-of")).groundOf
  const terrain = {
    ...(await import("#/world/scene/terrain")),
    ...(await import("#/world/scene/paint-ground")),
    ...(await import("#/world/scene/paint-rows")),
    ...(await import("#/world/scene/mesh-heights")),
  }
  const result = groundOf(invalid)
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(1))
  WorkerStub.all[0].onmessage?.({ data: { y0: invalid === "offset" ? 1 : 0, data: new Uint8ClampedArray(invalid === "length" ? 4 : 16).fill(7) } })
  expect((await result).data[0]).toBe(0)
  expect(terrain.paintRows).toHaveBeenCalledOnce()
})

it("terminates sibling workers when one prefetch band fails", async () => {
  vi.stubGlobal("navigator", { hardwareConcurrency: 3 })
  const prefetchGround = (await import("#/world/scene/prefetch-ground")).prefetchGround
  const terrain = {
    ...(await import("#/world/scene/terrain")),
    ...(await import("#/world/scene/paint-ground")),
    ...(await import("#/world/scene/paint-rows")),
    ...(await import("#/world/scene/mesh-heights")),
  }
  prefetchGround("siblings")
  await vi.waitFor(() => expect(WorkerStub.all).toHaveLength(2))
  const lateReply = WorkerStub.all[1].onmessage
  WorkerStub.all[0].fail()
  await vi.waitFor(() => expect(WorkerStub.all[1].terminate).toHaveBeenCalledOnce())
  lateReply?.({ data: { y0: 1, data: new Uint8ClampedArray(8), fields: {} } })
  const world = {
    ...(await import("#/world/scene/world")),
    ...(await import("#/world/scene/river-x")),
    ...(await import("#/lib/engine/in-rect")),
    ...(await import("#/world/scene/ensure-fields")),
    ...(await import("#/world/scene/current-layout")),
    ...(await import("#/world/scene/set-layout")),
    ...(await import("#/world/scene/fields-now")),
    ...(await import("#/world/scene/prime-fields")),
    ...(await import("#/world/scene/has-fields")),
    ...(await import("#/world/scene/ground-h")),
    ...(await import("#/world/scene/river-d")),
    ...(await import("#/world/scene/road-d")),
    ...(await import("#/world/scene/trail-d")),
    ...(await import("#/world/scene/road-kind")),
    ...(await import("#/world/scene/bridge-deck-h")),
    ...(await import("#/world/scene/set-walk-surfaces")),
    ...(await import("#/world/scene/add-walk-surfaces")),
    ...(await import("#/world/scene/walk-h")),
    ...(await import("#/world/scene/block-rect")),
    ...(await import("#/world/scene/block-circle")),
    ...(await import("#/world/scene/init-walk")),
    ...(await import("#/world/scene/is-free")),
  }
  expect(world.primeFields).not.toHaveBeenCalled()
  for (const worker of WorkerStub.all) {
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(worker.onmessage).toBeNull()
    expect(worker.onerror).toBeNull()
    expect(worker.onmessageerror).toBeNull()
  }
  expect(terrain.paintRows).not.toHaveBeenCalled()
})
