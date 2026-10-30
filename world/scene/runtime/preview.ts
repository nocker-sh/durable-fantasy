import type * as THREE from "three"
import { keyTurn } from "#/world/scene/key-turn"

type PreviewScene = {
  renderer: THREE.WebGLRenderer
  movement: { yaw: number; yawTarget: number }
  pan(dx: number, dy: number, yaw: number): void
  zoom(delta: number): void
}

/**
 * The free camera of the /dev map view: no player, nothing to click. Dragging slides the ground
 * along with the pointer, the wheel zooms, the arrow keys and WASD slide the view, Q and E (or a
 * right-button drag) turn it in the game's 45° steps.
 */
export function createPreviewControls(inputProps: PreviewScene) {
  const renderer = inputProps.renderer
  const movement = inputProps.movement
  const pan = inputProps.pan
  const zoom = inputProps.zoom

  const el = renderer.domElement
  let drag: { id: number; x: number; y: number; turn: boolean } | null = null
  const held = new Set<string>()
  const onDown = (e: PointerEvent) => {
    if (drag) return
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, turn: e.button === 2 }
    el.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y
    if (drag.turn) {
      if (Math.abs(dx) < 90) return
      movement.yawTarget += keyTurn(dx > 0 ? 1 : -1)
      drag.x = e.clientX
      return
    }
    pan(dx, dy, movement.yaw)
    drag.x = e.clientX
    drag.y = e.clientY
  }
  const onUp = (e: PointerEvent) => {
    if (drag?.id === e.pointerId) drag = null
  }
  let wheelAt = 0
  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const now = performance.now()
    if (now - wheelAt < 180) return
    wheelAt = now
    zoom(-Math.sign(e.deltaY))
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
    const key = e.key.toLowerCase()
    if (e.type === "keyup") {
      held.delete(key)
      return
    }
    if (key === "q") movement.yawTarget += keyTurn(1)
    else if (key === "e") movement.yawTarget += keyTurn(-1)
    else held.add(key)
  }
  const onBlur = () => {
    drag = null
    held.clear()
  }
  const noMenu = (e: Event) => e.preventDefault()
  el.addEventListener("pointerdown", onDown)
  el.addEventListener("pointermove", onMove)
  el.addEventListener("pointerup", onUp)
  el.addEventListener("pointercancel", onUp)
  el.addEventListener("wheel", onWheel, { passive: false })
  el.addEventListener("contextmenu", noMenu)
  window.addEventListener("keydown", onKey)
  window.addEventListener("keyup", onKey)
  window.addEventListener("blur", onBlur)
  return {
    /** Slide the view along the held keys, at a screen's height every two seconds or so. */
    update(dt: number, height: number) {
      const step = height * 0.5 * dt
      const x = (held.has("d") || held.has("arrowright") ? 1 : 0) - (held.has("a") || held.has("arrowleft") ? 1 : 0)
      const y = (held.has("s") || held.has("arrowdown") ? 1 : 0) - (held.has("w") || held.has("arrowup") ? 1 : 0)
      if (x || y) pan(-x * step, -y * step, movement.yaw)
    },
    dispose() {
      onBlur()
      el.removeEventListener("pointerdown", onDown)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerup", onUp)
      el.removeEventListener("pointercancel", onUp)
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("contextmenu", noMenu)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("keyup", onKey)
      window.removeEventListener("blur", onBlur)
    },
  }
}
