import { describe, expect, it } from "vitest"
import { readDrawnRect } from "#/components/game/read-drawn-rect"

const element = { offsetLeft: 10, offsetTop: 20, offsetWidth: 300, offsetHeight: 100 }

describe("readDrawnRect", () => {
  it("scales the layout box to the canvas pixels", () => {
    const canvas = { width: 2000, height: 1000, clientWidth: 1000, clientHeight: 500 }
    expect(readDrawnRect({ canvas, element })).toEqual({ x: 20, y: 40, width: 600, height: 200 })
  })

  it("keeps the layout box when the canvas has no size yet", () => {
    const canvas = { width: 300, height: 150, clientWidth: 0, clientHeight: 0 }
    expect(readDrawnRect({ canvas, element })).toEqual({ x: 10, y: 20, width: 300, height: 100 })
  })
})
