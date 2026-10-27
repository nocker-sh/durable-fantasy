/** One sample of a fixed two-dimensional field; moving invalidates the cached value. */
export class PositionSample {
  private x = NaN
  private z = NaN
  private value = 0

  constructor(private readonly sample: (x: number, z: number) => number) {}

  at(x: number, z: number): number {
    if (x !== this.x || z !== this.z) {
      this.value = this.sample(x, z)
      this.x = x
      this.z = z
    }
    return this.value
  }
}
