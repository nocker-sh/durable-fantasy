import { expect, it, vi } from "vitest"
import { ScreenLabels } from "./screen-labels"

function label() {
  let currentDisplay = ""
  let currentTransform = ""
  const style = {
    get display() {
      return currentDisplay
    },
    set display(value: string) {
      currentDisplay = value
    },
    get transform() {
      return currentTransform
    },
    set transform(value: string) {
      currentTransform = value
    },
  }
  const display = vi.spyOn(style, "display", "set")
  const transform = vi.spyOn(style, "transform", "set")
  return { element: { style } as HTMLElement, display, transform }
}

it("avoids repeated style writes for stationary labels over 600 frames", () => {
  const labels = new ScreenLabels()
  const { element, display, transform } = label()
  for (let frame = 0; frame < 600; frame++) labels.place(element, true, 120, 80)
  expect(display).not.toHaveBeenCalled()
  expect(transform).toHaveBeenCalledTimes(1)
  expect(element.style.transform).toBe("translate(120px, 80px) translate(-50%, -100%)")
})

it("hides once and positions a returning label at its new location", () => {
  const labels = new ScreenLabels()
  const { element, display, transform } = label()
  labels.place(element, true, 20, 30)
  for (let frame = 0; frame < 600; frame++) labels.place(element, false)
  expect(display).toHaveBeenCalledTimes(1)
  expect(element.style.display).toBe("none")
  expect(transform).toHaveBeenCalledTimes(1)
  labels.place(element, true, 90, 100)
  expect(element.style.display).toBe("")
  expect(element.style.transform).toBe("translate(90px, 100px) translate(-50%, -100%)")
})

it("tracks different elements independently and applies movement in either axis", () => {
  const labels = new ScreenLabels()
  const a = label()
  const b = label()
  labels.place(a.element, false)
  labels.place(b.element, true, 10, 20)
  labels.place(a.element, true, 10, 20)
  labels.place(a.element, true, 11, 20)
  labels.place(a.element, true, 11, 21)
  expect(a.transform).toHaveBeenCalledTimes(3)
  expect(b.transform).toHaveBeenCalledTimes(1)
  expect(a.element.style.transform).toBe("translate(11px, 21px) translate(-50%, -100%)")
})
