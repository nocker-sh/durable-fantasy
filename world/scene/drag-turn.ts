import { keyTurn } from "#/world/scene/key-turn"

/** The change of the camera's yaw for a drag of `dx` pixels (one step per 90 px): right turns as Shift+Q does. */
export const dragTurn = (dx: number) => (Math.abs(dx) >= 90 ? keyTurn(dx > 0 ? 1 : -1) : 0)
