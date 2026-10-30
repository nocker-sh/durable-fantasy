import { bendDamp } from "#/world/scene/rig"

/** 0 = play clips as authored, 1 = full chibi softening of torso bends */
export function setBendDamp(k: number) {
  bendDamp.value = k
}
