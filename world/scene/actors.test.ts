import { afterEach, describe, expect, it, vi } from "vitest"
import * as THREE from "three"
import { Actor, Figure, view } from "./actors"
import * as terrain from "./world"
import { bakedStrip, spriteFrame } from "./sprite-pool"

vi.mock("./sprite-pool", () => ({
  lookKey: () => "test-look",
  bakedStrip: vi.fn(() => undefined),
  spriteFrame: vi.fn(() => null),
}))

const look = { top: "cCream", bottom: "cGray", sex: "m", skin: "skin1", hair: "hBrown", style: "curly", eye: "cBlue" } as const

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function canvasDocument() {
  const drawImage = vi.fn()
  vi.stubGlobal("document", { createElement: () => ({ width: 0, height: 0, getContext: () => ({ clearRect: vi.fn(), drawImage }) }) })
  return drawImage
}

it("reuses resident ground height while stationary and resamples after movement or relocation", () => {
  canvasDocument()
  const height = vi.spyOn(terrain, "walkH").mockImplementation((x, z) => x / 10 + z / 20)
  const actor = new Actor("エルナ", "", look, [20, 30], [], [], new THREE.Scene())
  for (let i = 0; i < 120; i++) actor.update(1 / 60, i / 60, () => {})
  expect(height).toHaveBeenCalledTimes(1)
  expect(actor.fig.root.position.y).toBe(3.5)
  expect(actor.animT).toBeGreaterThan(0)
  actor.path = [[21, 30]]
  actor.update(1 / 60, 2, () => {})
  expect(height).toHaveBeenCalledTimes(2)
  expect(actor.fig.root.position.y).toBeCloseTo(actor.pos[0] / 10 + actor.pos[1] / 20)
  actor.path = []
  actor.pos = [10, 10]
  actor.place()
  expect(height).toHaveBeenCalledTimes(3)
  expect(actor.fig.root.position.y).toBe(1.5)
  actor.place()
  expect(height).toHaveBeenCalledTimes(3)
  actor.fig.dispose()
})

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

it("samples a nested figure's world position once per refresh while following parent movement", () => {
  canvasDocument()
  const figure = new Figure(look, { item: null, url: (_anim, v) => `pose-${v}.png` })
  figure.prefetch("idle", null)
  for (const call of vi.mocked(bakedStrip).mock.calls) call[2]!({} as ImageBitmap)
  const parent = new THREE.Group()
  parent.position.set(5, 2, -3)
  parent.rotation.y = 0.4
  parent.scale.setScalar(1.5)
  parent.add(figure.root)
  figure.root.position.set(2, 1, 4)
  figure.root.rotation.y = 0.3
  const camera = view.cam.clone()
  view.cam.set(12, 10, 14)
  const position = vi.spyOn(figure.root, "getWorldPosition")
  try {
    for (let frame = 0; frame < 3; frame++) {
      parent.position.x += 1
      parent.updateMatrixWorld(true)
      const at = new THREE.Vector3().setFromMatrixPosition(figure.root.matrixWorld)
      const delta = view.cam.clone().sub(at)
      const horizontal = Math.hypot(delta.x, delta.z)
      figure.refresh()
      expect(position).toHaveBeenCalledTimes(frame + 1)
      expect(figure.sprite.visible).toBe(true)
      expect(figure.sprite.rotation.y).toBeCloseTo(Math.atan2(delta.x, delta.z) - figure.root.rotation.y)
      expect(figure.sprite.scale.y).toBeCloseTo(Math.min(2.5, Math.hypot(horizontal, delta.y) / horizontal))
      expect(figure.sprite.position.x).toBeCloseTo((delta.x / horizontal) * 0.12)
      expect(figure.sprite.position.z).toBeCloseTo((delta.z / horizontal) * 0.12)
    }
  } finally {
    view.cam.copy(camera)
    position.mockRestore()
    figure.dispose()
  }
})
