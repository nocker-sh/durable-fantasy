// Which way the view turns, for every way of turning it (ui.md §7): Shift+Q and dragging to the
// right turn it one way, Shift+E and dragging to the left the other, a 45° step at a time.
// turn.test.ts holds these fixed, so the direction does not drift back.

export const STEP = Math.PI / 4
