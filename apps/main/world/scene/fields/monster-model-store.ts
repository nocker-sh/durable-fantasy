import type * as THREE from "three"
import type { MonsterModel } from "#/world/core/monster-model-types"

export type LoadedMonsterModel = { scene: THREE.Group; walk: THREE.AnimationClip; idle: THREE.AnimationClip }

/** Models being fetched, and those already here so a creature can be drawn from them at once. */
export const monsterModels = {
  loading: new Map<MonsterModel["id"], Promise<LoadedMonsterModel>>(),
  loaded: new Map<MonsterModel["id"], LoadedMonsterModel>(),
}
