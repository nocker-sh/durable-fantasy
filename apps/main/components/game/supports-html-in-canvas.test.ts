import { afterEach, describe, expect, it, vi } from "vitest"
import { supportsHtmlInCanvas } from "#/components/game/supports-html-in-canvas"

type Stub = Readonly<{ reflects: boolean; geometry: boolean; draws: boolean }>

function stubCanvas(stub: Stub) {
  const canvas: { content?: string; updateElementGeometry?: () => void; getElementTransform?: () => void; setAttribute(name: string, value: string): void } = {
    setAttribute(name, value) {
      if (stub.reflects && name === "content") canvas.content = value
    },
  }
  if (stub.geometry) {
    canvas.updateElementGeometry = () => {}
    canvas.getElementTransform = () => {}
  }
  vi.stubGlobal("document", { createElement: () => canvas })
  vi.stubGlobal("CanvasRenderingContext2D", { prototype: stub.draws ? { drawElementImage() {} } : {} })
}

describe("supportsHtmlInCanvas", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("is false on the server", () => {
    expect(supportsHtmlInCanvas()).toBe(false)
  })

  it("is false when the canvas does not read the attribute", () => {
    stubCanvas({ reflects: false, geometry: true, draws: true })
    expect(supportsHtmlInCanvas()).toBe(false)
  })

  it("is false when what is drawn cannot be clicked", () => {
    stubCanvas({ reflects: true, geometry: false, draws: true })
    expect(supportsHtmlInCanvas()).toBe(false)
  })

  it("is false when the context cannot draw elements", () => {
    stubCanvas({ reflects: true, geometry: true, draws: false })
    expect(supportsHtmlInCanvas()).toBe(false)
  })

  it("is true when the canvas reads the attribute, draws elements and takes their geometry", () => {
    stubCanvas({ reflects: true, geometry: true, draws: true })
    expect(supportsHtmlInCanvas()).toBe(true)
  })
})
