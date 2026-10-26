import { describe, expect, it, vi } from "vitest"
import { BitmapCache } from "./bitmap-cache.ts"

const bitmap = (width = 2, height = 2) => ({ width, height, close: vi.fn() }) as unknown as ImageBitmap

describe("decoded bitmap cache", () => {
  it("releases least recently used images under the byte budget", () => {
    const cache = new BitmapCache(32, 10)
    const a = bitmap(),
      b = bitmap(),
      c = bitmap()
    cache.set("a", a)
    cache.set("b", b)
    expect(cache.get("a")).toBe(a)
    cache.set("c", c)
    expect(cache.get("b")).toBeUndefined()
    expect(b.close).toHaveBeenCalledOnce()
    expect(a.close).not.toHaveBeenCalled()
    expect(cache.bytes).toBe(32)
    cache.clear()
    expect(a.close).toHaveBeenCalledOnce()
    expect(c.close).toHaveBeenCalledOnce()
    expect(cache.bytes).toBe(0)
  })
  it("stays bounded over repeated image churn", () => {
    const cache = new BitmapCache(1024, 8)
    const images: ImageBitmap[] = []
    for (let i = 0; i < 2000; i++) {
      const image = bitmap(4 + (i % 12), 8)
      images.push(image)
      cache.set(String(i), image)
      expect(cache.bytes).toBeLessThanOrEqual(1024)
      expect(cache.size).toBeLessThanOrEqual(8)
    }
    cache.clear()
    for (const image of images) expect(image.close).toHaveBeenCalledOnce()
  })
  it("bounds failed loads as well as images", () => {
    const cache = new BitmapCache(32, 2)
    cache.set("failed", null)
    cache.set("other", null)
    expect(cache.get("failed")).toBeNull()
    cache.set("next", null)
    expect(cache.get("other")).toBeUndefined()
    expect(cache.size).toBe(2)
  })
  it("releases replaced and oversized images without double closing", () => {
    const cache = new BitmapCache(16, 4)
    const a = bitmap(),
      b = bitmap(3, 3)
    cache.set("a", a)
    cache.set("a", a)
    expect(a.close).not.toHaveBeenCalled()
    cache.set("a", b)
    expect(a.close).toHaveBeenCalledOnce()
    expect(b.close).toHaveBeenCalledOnce()
    expect(cache.get("a")).toBeUndefined()
    expect(cache.bytes).toBe(0)
    cache.clear()
    expect(b.close).toHaveBeenCalledOnce()
  })
})
