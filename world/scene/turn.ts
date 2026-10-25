// Which way the view turns, for every way of turning it (ui.md §7): Shift+Q and dragging to the
// right turn it one way, Shift+E and dragging to the left the other, a 45° step at a time.
// turn.test.ts holds these fixed, so the direction does not drift back.

export const STEP = Math.PI / 4

/** The change of the camera's yaw for a key turn: `steps` is +1 for Shift+Q, -1 for Shift+E. */
export const keyTurn = (steps: number) => steps * STEP

/** The change of the camera's yaw for a drag of `dx` pixels (one step per 90 px): right turns as Shift+Q does. */
export const dragTurn = (dx: number) => (Math.abs(dx) >= 90 ? keyTurn(dx > 0 ? 1 : -1) : 0)
