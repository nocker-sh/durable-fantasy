// Public entry points; implementation lives in focused modules.
export { type Cell, type ResidentInfo, type WalkerInfo, type SceneEvents, type Avatar } from "./runtime/types.ts"
export { TIMES_OF_DAY, diorama } from "./runtime/settings.ts"
export { MapScene } from "./runtime/scene.ts"
export { spriteManifest } from "./runtime/assets.ts"
export { type Look } from "./figure"
export { type Item } from "./figure"
