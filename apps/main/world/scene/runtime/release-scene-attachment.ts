import type { SceneRuntime } from "#/world/scene/runtime/scene-runtime-types"

type Props = {
  runtime: (Pick<SceneRuntime, "running" | "events" | "dispose"> & { renderer: { domElement: { remove(): void } } }) | null
  observer: Pick<ResizeObserver, "disconnect"> | null
  layer: { remove(): void }
}

/** 一つの解放の失敗で、描画の停止や残りの DOM・資源の回収を飛ばさない。 */
export function releaseSceneAttachment(props: Props): void {
  if (props.runtime) {
    props.runtime.running = false
    props.runtime.events = null
  }
  const failures: unknown[] = []
  for (const release of [() => props.observer?.disconnect(), () => props.runtime?.renderer.domElement.remove(), () => props.runtime?.dispose(), () => props.layer.remove()]) {
    try {
      release()
    } catch (error) {
      failures.push(error)
    }
  }
  if (failures.length === 1) throw failures[0]
  if (failures.length > 1) throw new AggregateError(failures, "Scene attachment cleanup failed")
}
