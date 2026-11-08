import type { KeyboardEvent } from "react"

/** Keep ordinary Tab navigation inside the active game dialog, including when disabled controls change during saving. */
export function keepDialogTabFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab" || event.ctrlKey || event.metaKey || event.altKey) return
  const dialog = event.currentTarget,
    controls = Array.from(dialog.querySelectorAll<HTMLElement>("button, input, select, textarea, a[href], [tabindex]")).filter(
      (control) => control.tabIndex >= 0 && !control.matches(":disabled") && control.getClientRects().length > 0,
    )
  const first = controls[0],
    last = controls.at(-1),
    active = dialog.ownerDocument.activeElement
  if (!first || !last) {
    event.preventDefault()
    dialog.focus()
    return
  }

  if (event.shiftKey && (active === first || active === dialog)) {
    event.preventDefault()
    last.focus()
  }
  if (!event.shiftKey && (active === last || active === dialog)) {
    event.preventDefault()
    first.focus()
  }
}
