/** Sine and cosine waves with fixed per-sample phases and a shared moving phase. */
export class PhaseOscillator {
  private readonly sine: Float64Array
  private readonly cosine: Float64Array
  private sinTime = 0
  private cosTime = 1

  constructor(count: number, step: number) {
    this.sine = Float64Array.from({ length: count }, (_, i) => Math.sin(i * step))
    this.cosine = Float64Array.from({ length: count }, (_, i) => Math.cos(i * step))
  }

  setTime(time: number) {
    this.sinTime = Math.sin(time)
    this.cosTime = Math.cos(time)
  }

  sin(index: number) {
    return this.sinTime * this.cosine[index] + this.cosTime * this.sine[index]
  }

  cos(index: number) {
    return this.cosTime * this.cosine[index] - this.sinTime * this.sine[index]
  }
}
