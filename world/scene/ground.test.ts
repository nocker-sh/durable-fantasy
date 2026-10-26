import { afterEach, beforeEach, expect, it, vi } from "vitest"

vi.mock("./terrain", () => ({ GROUND_PX: 2, paintRows: vi.fn() }))
vi.mock("./world", () => {
  let layout = { id: "original" }
  return {
    hasFields: () => false,
    primeFields: vi.fn(),
    currentLayout: () => layout,
    setLayout: vi.fn((next) => {
      layout = next
    }),
  }
})
vi.mock("../maps/layouts.ts", () => ({ layoutOf: (id: string) => ({ id }) }))

class WorkerStub {
  static all: WorkerStub[] = []
  job?: { map: string; y0: number; y1: number }
  onmessage?: (event: { data: { data: Uint8ClampedArray; y0: number } }) => void
  onerror?: (event: { preventDefault(): void }) => void
  terminate = vi.fn()
  constructor() {
    WorkerStub.all.push(this)
  }
  postMessage(job: WorkerStub["job"]) {
    this.job = job
  }
  finish() {
    this.onmessage?.({ data: { data: new Uint8ClampedArray(16).fill(7), y0: 0 } })
  }
  fail() {
    this.onerror?.({ preventDefault() {} })
  }
}

beforeEach(() => {
  WorkerStub.all = []
  vi.stubGlobal("Worker", WorkerStub)
  vi.stubGlobal("navigator", { hardwareConcurrency: 2 })
  vi.stubGlobal("indexedDB", undefined)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  vi.resetModules()
})

it("joins an active prefetch instead of starting a second painter", async () => {
  const { groundOf, prefetchGround } = await import("./ground")
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
  const { groundOf, prefetchGround } = await import("./ground")
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
  const { groundOf, prefetchGround } = await import("./ground")
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
  const { groundOf, prefetchGround } = await import("./ground")
  // Import after resetModules so these are the instances used by ground.ts.
  const world = await import("./world")
  const terrain = await import("./terrain")
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
  const { groundOf } = await import("./ground")
  const terrain = await import("./terrain")
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
