import type { Walker } from "#/world/scene/runtime/walker"

/** Camera input reads the current player position and path rather than their initial arrays. */
export function createWalkerMovement(me: Pick<Walker, "pos" | "path">) {
  return {
    get pos() {
      return me.pos
    },
    get path() {
      return me.path
    },
    yaw: Math.PI / 4,
    yawTarget: Math.PI / 4,
  }
}
