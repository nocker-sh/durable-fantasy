import { STEP } from "#/world/scene/turn"

/** The change of the camera's yaw for a key turn: `steps` is +1 for Shift+Q, -1 for Shift+E. */
export const keyTurn = (steps: number) => steps * STEP
