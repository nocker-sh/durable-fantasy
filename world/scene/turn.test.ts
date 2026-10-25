import { describe, expect, it } from "vitest"
import { STEP, dragTurn, keyTurn } from "./turn.ts"

/** Where a point east of the player shows on screen after a turn (the camera stands at yaw, looking at the player). */
function screenX(yaw: number, point: [number, number]) {
  // the camera's right, in the ground plane (index.ts places it at (sin yaw, cos yaw) from the player)
  const right: [number, number] = [Math.cos(yaw), -Math.sin(yaw)]
  return point[0] * right[0] + point[1] * right[1]
}

describe("which way the view turns", () => {
  it("Shift+Q and Shift+E turn opposite ways, a 45° step each", () => {
    expect(keyTurn(1)).toBeCloseTo(STEP)
    expect(keyTurn(-1)).toBeCloseTo(-STEP)
  })

  it("dragging right turns as Shift+Q does, dragging left as Shift+E; a short drag does nothing", () => {
    expect(dragTurn(120)).toBeCloseTo(keyTurn(1))
    expect(dragTurn(-120)).toBeCloseTo(keyTurn(-1))
    expect(dragTurn(40)).toBe(0)
  })

  it("dragging right (and Shift+Q) moves what is ahead of you to the right on screen, as if the ground were dragged", () => {
    const yaw = Math.PI / 4
    const ahead: [number, number] = [-Math.sin(yaw) * 3, -Math.cos(yaw) * 3]
    expect(screenX(yaw + dragTurn(120), ahead)).toBeGreaterThan(screenX(yaw, ahead))
    expect(screenX(yaw + keyTurn(1), ahead)).toBeGreaterThan(screenX(yaw, ahead))
  })
})
