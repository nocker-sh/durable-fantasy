type LabelPosition = {
  visible: boolean
  x?: number
  y?: number
}

/** Updates projected DOM labels only when their visibility or pixel position changes. */
export class ScreenLabels {
  private readonly positions = new WeakMap<HTMLElement, LabelPosition>()

  place(inputProps: { element: HTMLElement; visible: boolean; x?: number; y?: number }) {
    const element = inputProps.element
    const visible = inputProps.visible
    const x = inputProps.x === undefined ? 0 : inputProps.x
    const y = inputProps.y === undefined ? 0 : inputProps.y

    let previous = this.positions.get(element)
    if (!previous) {
      previous = { visible: !visible }
      this.positions.set(element, previous)
    }
    if (previous.visible !== visible) {
      const display = visible ? "" : "none"
      if (element.style.display !== display) element.style.display = display
      previous.visible = visible
    }
    if (!visible || (previous.x === x && previous.y === y)) return
    element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
    previous.x = x
    previous.y = y
  }
}
