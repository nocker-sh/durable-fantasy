import { pending, running } from "#/world/scene/sprite-pool"

export const spritesPending = () => pending.size + running.size
