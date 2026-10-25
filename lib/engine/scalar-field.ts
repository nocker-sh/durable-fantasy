/** Bilinear sampling over a square field, clamped to its sample bounds. */
export class ScalarField {
  constructor(
    readonly data: Float32Array,
    readonly size: number,
    readonly resolution = 1,
  ) {}
  sample(x: number, z: number): number {
    const f = this.data;
    const u = Math.min(this.size - 1.001, Math.max(0, x * this.resolution)),
      v = Math.min(this.size - 1.001, Math.max(0, z * this.resolution));
    const i = Math.floor(u),
      j = Math.floor(v),
      fu = u - i,
      fv = v - j;
    const k = j * this.size + i;
    return f[k] * (1 - fu) * (1 - fv) + f[k + 1] * fu * (1 - fv) + f[k + this.size] * (1 - fu) * fv + f[k + this.size + 1] * fu * fv;
  }
}
