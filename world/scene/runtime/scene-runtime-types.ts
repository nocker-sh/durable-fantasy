import type { createSceneRuntime } from "#/world/scene/runtime/create-scene-runtime"

export type SceneRuntime = Awaited<ReturnType<typeof createSceneRuntime>>
