import { afterEach, expect, it, vi } from "vitest"
const { renderFrame } = vi.hoisted(() => ({ renderFrame: vi.fn() }))
vi.mock("#/world/scene/figure/animation", () => ({ ANIMS: { idle: {} } }))
vi.mock("#/world/scene/figure/render", () => ({ FW: 1, FH: 1 }))
vi.mock("#/world/scene/figure/render-frame", () => ({ renderFrame }))
vi.mock("./pix", () => ({
  PixBuf: class {
    data = new Uint8ClampedArray(4)
  },
}))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
  vi.resetAllMocks()
})

it.each(["encode", "render"])("replies and handles the next job after a %s failure", async (failure) => {
  const bitmap = { width: 1, height: 1 }
  const png = new Blob()
  const encode = vi.fn(async () => png)
  if (failure === "encode") encode.mockRejectedValueOnce(Error("Encoding failed"))
  else
    renderFrame.mockImplementationOnce(() => {
      throw Error("Rendering failed")
    })
  const postMessage = vi.fn()
  const scope = { postMessage, onmessage: undefined as undefined | ((event: { data: unknown }) => Promise<void>) }
  vi.stubGlobal("self", scope)
  vi.stubGlobal("ImageData", class {})
  vi.stubGlobal(
    "OffscreenCanvas",
    class {
      getContext() {
        return { clearRect() {}, putImageData() {} }
      }
      convertToBlob = encode
      transferToImageBitmap() {
        return bitmap
      }
    },
  )
  await import("./sprite.worker")
  const job = { key: "first", look: {}, anim: "idle", f: 0, view: 0, item: null }
  await scope.onmessage!({ data: job })
  if (failure === "encode") expect(postMessage).toHaveBeenNthCalledWith(1, { key: "first", bitmap, png: null }, [bitmap])
  else expect(postMessage).toHaveBeenNthCalledWith(1, { key: "first", failed: true })
  await scope.onmessage!({ data: { ...job, key: "next" } })
  expect(postMessage).toHaveBeenLastCalledWith({ key: "next", bitmap, png }, [bitmap])
})
