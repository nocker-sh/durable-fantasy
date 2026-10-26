import { afterEach, describe, expect, it, vi } from "vitest"
import * as THREE from "three"
import { Figure } from "./actors"
import { bakedStrip, spriteFrame } from "./sprite-pool"

vi.mock("./sprite-pool", () => ({
  lookKey: () => "test-look",
  bakedStrip: vi.fn(() => undefined),
  spriteFrame: vi.fn(() => null),
}))

const look = { top: "cCream", bottom: "cGray", sex: "m", skin: "skin1", hair: "hBrown", style: "curly", eye: "cBlue" } as const

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function canvasDocument() {
  const drawImage = vi.fn()
  vi.stubGlobal("document", { createElement: () => ({ width: 0, height: 0, getContext: () => ({ clearRect: vi.fn(), drawImage }) }) })
  return drawImage
}

describe("figure resource lifetime", () => {
  it("requests each pending frame once and ignores completion after disposal", () => {
    const draw = canvasDocument()
    const figure = new Figure(look)
    const scene = new THREE.Scene()
    scene.add(figure.root)
    figure.prefetch("idle", null)
    figure.prefetch("idle", null)
    expect(spriteFrame).toHaveBeenCalledTimes(8)
    const done = vi.mocked(spriteFrame).mock.calls[0][6]!
    const release = vi.spyOn(THREE.Texture.prototype, "dispose")
    figure.dispose()
    expect(release).toHaveBeenCalledTimes(8)
    expect(scene.children).toHaveLength(0)
    done({} as ImageBitmap)
    figure.prefetch("idle", null)
    figure.refresh()
    figure.dispose()
    expect(draw).not.toHaveBeenCalled()
    expect(spriteFrame).toHaveBeenCalledTimes(8)
    expect(release).toHaveBeenCalledTimes(8)
    release.mockRestore()
  })

  it("bounds retained strips and ignores evicted frame completions", () => {
    const draw = canvasDocument()
    const figure = new Figure(look)
    const release = vi.spyOn(THREE.Texture.prototype, "dispose")
    figure.prefetch("idle", null)
    const stale = vi.mocked(spriteFrame).mock.calls[0][6]!
    figure.prefetch("walk", null)
    figure.prefetch("carry", null)
    expect(release).toHaveBeenCalledTimes(8)
    stale({} as ImageBitmap)
    expect(draw).not.toHaveBeenCalled()
    // Evicted directions can be requested again, rather than remaining permanently pending.
    figure.prefetch("idle", null)
    expect(spriteFrame).toHaveBeenCalledTimes(32)
    figure.dispose()
    expect(release).toHaveBeenCalledTimes(32)
    release.mockRestore()
  })

  it("keeps the displayed texture alive while evicting and ignores stale baked strips", () => {
    const draw = canvasDocument()
    const figure = new Figure(look, { item: null, url: (anim, v) => `${anim}-${v}.png` })
    figure.prefetch("idle", null)
    vi.mocked(bakedStrip).mock.calls[0][2]!({} as ImageBitmap)
    const stale = vi.mocked(bakedStrip).mock.calls[1][2]!
    figure.refresh()
    const displayed = figure.sprite.material.map!
    const release = vi.spyOn(displayed, "dispose")
    figure.prefetch("walk", null)
    figure.prefetch("carry", null)
    stale({} as ImageBitmap)
    expect(draw).toHaveBeenCalledTimes(1)
    expect(release).not.toHaveBeenCalled()
    expect(figure.sprite.material.map).toBe(displayed)
    figure.dispose()
    expect(release).toHaveBeenCalledTimes(1)
    release.mockRestore()
  })

  it("requests a baked strip once while pending and falls back after failure", () => {
    canvasDocument()
    const figure = new Figure(look, { item: null, url: (_anim, v) => `test-${v}.png` })
    figure.prefetch("idle", null)
    figure.prefetch("idle", null)
    expect(bakedStrip).toHaveBeenCalledTimes(8)
    expect(spriteFrame).not.toHaveBeenCalled()
    vi.mocked(bakedStrip).mock.calls[0][2]!(null)
    figure.prefetch("idle", null)
    expect(spriteFrame).toHaveBeenCalledTimes(1)
    figure.dispose()
  })
})
