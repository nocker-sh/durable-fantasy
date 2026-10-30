import { D } from "#/world/scene/rig"

export const clipDur = (name: string) => D.value.clips[name]?.dur ?? 1
