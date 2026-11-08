import type { SceneEvents } from "#/world/scene/runtime/types"

/** 破棄後の再接続を防ぎ、資源を返す前に描画とイベントの接続を止める。 */
export class SceneRuntimeLifecycle {
  private readonly state: { running: boolean; events: SceneEvents | null; disposed: boolean } = { running: false, events: null, disposed: false }

  constructor() {
    Object.freeze(this)
  }

  get running(): boolean {
    return this.state.running
  }

  set running(running: boolean) {
    if (!this.state.disposed) this.state.running = running
  }

  get events(): SceneEvents | null {
    return this.state.events
  }

  set events(events: SceneEvents | null) {
    if (!this.state.disposed) this.state.events = events
  }

  dispose(): void {
    this.state.disposed = true
    this.state.running = false
    this.state.events = null
  }
}
