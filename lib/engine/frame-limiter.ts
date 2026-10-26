/** Keep rendering on a fixed cadence without replaying frames missed during a stall. */
export class FrameLimiter {
  private previous: number | null = null
  private readonly interval: number
  private readonly tolerance: number

  constructor(fps: number) {
    if (!Number.isFinite(fps) || fps <= 0) throw new RangeError("Frame rate must be positive")
    this.interval = 1000 / fps
    this.tolerance = Math.min(0.25, this.interval / 100)
  }

  ready(time: number): boolean {
    if (!Number.isFinite(time)) return false
    if (this.previous === null || time < this.previous - this.tolerance) {
      this.previous = time
      return true
    }
    const elapsed = time - this.previous
    const steps = Math.floor((elapsed + this.tolerance) / this.interval)
    if (steps < 1) return false
    this.previous += steps * this.interval
    return true
  }
}
