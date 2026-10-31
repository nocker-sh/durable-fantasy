import { FrameLimiter } from "#/lib/engine/frame-limiter"

import type { SceneFrame } from "#/world/scene/runtime/scene-frame-types"
type Props = Readonly<{
  clock: { getDelta(): number; readonly elapsedTime: number }
  running(): boolean
  render(frame: SceneFrame): void
  tick(): void
}>

/** 描画の周期と計測を保持し、世界の更新順は呼び出し側へ渡す。 */
export class SceneFrameLoop {
  private readonly state = { frames: 0, fpsAt: performance.now(), fps: 0, lastReport: 0, isScheduled: false, isRendering: false }
  private readonly limiter = new FrameLimiter(60)

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  get fps(): number {
    return this.state.fps
  }

  readonly start = (): void => {
    if (this.state.isScheduled || this.state.isRendering) return
    this.props.clock.getDelta()
    this.schedule()
  }

  readonly record = (now: number): void => {
    this.state.frames++
    if (now - this.state.fpsAt >= 1000) {
      this.state.fps = (this.state.frames * 1000) / (now - this.state.fpsAt)
      this.state.frames = 0
      this.state.fpsAt = now
    }
    if (now - this.state.lastReport > 200) {
      this.state.lastReport = now
      this.props.tick()
    }
  }

  private schedule(): void {
    if (this.state.isScheduled) return
    this.state.isScheduled = true
    try {
      requestAnimationFrame(this.frame)
    } catch (error) {
      this.state.isScheduled = false
      throw error
    }
  }

  private readonly frame = (at: number): void => {
    this.state.isScheduled = false
    if (!this.props.running()) return
    this.state.isRendering = true
    try {
      if (this.limiter.ready(at)) {
        const elapsed = this.props.clock.getDelta()
        this.props.render({ at, elapsed, dt: Math.min(0.05, elapsed), time: this.props.clock.elapsedTime })
      }
    } finally {
      this.state.isRendering = false
    }
    if (this.props.running()) this.schedule()
  }
}
