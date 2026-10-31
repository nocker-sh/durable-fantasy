type Props = Readonly<{ samples: Float32Array; size: number; resolution?: number }>

/** Read-only view of owner-managed samples; owner updates stay visible without exposing the backing array. */
export class ScalarField {
  constructor(private readonly props: Props) {
    const samples = props.samples,
      size = props.size,
      configuredResolution = props.resolution,
      resolution = configuredResolution === undefined ? 1 : configuredResolution
    if (!(samples instanceof Float32Array) || !Number.isSafeInteger(size) || size < 2 || samples.length < size ** 2 || !Number.isFinite(resolution) || resolution <= 0)
      throw new RangeError("Invalid scalar field view")
    this.props = Object.freeze({ samples, size, resolution })
    Object.freeze(this)
  }
  get size(): number {
    return this.props.size
  }
  get resolution(): number {
    return this.props.resolution ?? 1
  }
  get sampleCount(): number {
    return this.props.samples.length
  }
  /** Clamped grid index used by both interpolation and interval queries. */
  gridCoordinate(value: number): number {
    return Math.min(this.size - 1.001, Math.max(0, value * this.resolution))
  }
  sample(x: number, z: number): number {
    const f = this.props.samples
    const u = this.gridCoordinate(x),
      v = this.gridCoordinate(z)
    const i = Math.floor(u),
      j = Math.floor(v),
      fu = u - i,
      fv = v - j
    const k = j * this.size + i
    return f[k] * (1 - fu) * (1 - fv) + f[k + 1] * fu * (1 - fv) + f[k + this.size] * (1 - fu) * fv + f[k + this.size + 1] * fu * fv
  }
}
