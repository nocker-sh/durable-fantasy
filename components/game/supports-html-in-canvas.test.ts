import { afterEach, describe, expect, it, vi } from "vitest"
import { supportsHtmlInCanvas } from "#/components/game/supports-html-in-canvas"

function stubCanvas(reflects: boolean) {
  const canvas: { content?: string; setAttribute(name: string, value: string): void } = {
    setAttribute(name, value) {
      if (reflects && name === "content") canvas.content = value
    },
  }
  vi.stubGlobal("document", { createElement: () => canvas })
}

describe("supportsHtmlInCanvas", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("is false on the server", () => {
    expect(supportsHtmlInCanvas()).toBe(false)
  })

  it("is false when the canvas does not read the attribute", () => {
    stubCanvas(false)
    expect(supportsHtmlInCanvas()).toBe(false)
  })

  it("is true when the canvas reads the attribute", () => {
    stubCanvas(true)
    expect(supportsHtmlInCanvas()).toBe(true)
  })
})
