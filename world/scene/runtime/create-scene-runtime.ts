import { withCleanup } from "#/lib/engine/with-cleanup"
import { groundOf } from "#/world/scene/ground-of"
import { lap } from "#/world/lap"
import { SceneBuildQueue } from "#/world/scene/runtime/scene-build-queue"
import { assembleSceneRuntime } from "#/world/scene/runtime/assemble-scene-runtime"
import type { SceneOptions } from "#/world/scene/runtime/scene-options"

const builds = new SceneBuildQueue()

/** Painting may overlap; assembly owns shared registries and must finish cleanup before the next build. */
export async function createSceneRuntime(map: string, progress: (text: string) => void, input: { signal?: AbortSignal; options?: SceneOptions } = {}) {
  input.signal?.throwIfAborted()
  progress("地面を描いています…")
  const ground = await groundOf(map)
  lap("scene: ground painted")
  return builds.run(() => withCleanup((resources) => assembleSceneRuntime({ map, progress, ground, options: input.options ?? {}, resources })), input.signal)
}
