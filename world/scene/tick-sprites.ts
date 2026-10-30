import { clock } from "#/world/scene/sprite-pool"

// ---------------------------------------------------------------- frames

/** Call once per animation frame so newer requests win over older ones. */
export function tickSprites() {
  clock.value++
}
